import { ponder } from "ponder:registry";
import { collections, phases, mints, transfers } from "ponder:schema";

// ── Factory events ────────────────────────────────────────────────────────────

ponder.on("Factory:CollectionCreated", async ({ event, context }) => {
  const address = event.args.collection;
  const client  = context.client;

  // Read on-chain state at the block this event landed in
  const [maxSupply, symbol] = await Promise.all([
    client.readContract({
      abi:          context.contracts.Collection.abi,
      address,
      functionName: "maxSupply",
    }),
    client.readContract({
      abi:          context.contracts.Collection.abi,
      address,
      functionName: "symbol",
    }),
  ]);

  await context.db.insert(collections).values({
    id:            address,
    creator:       event.args.creator,
    name:          event.args.name,
    symbol:        symbol as string,
    chainId:       context.chain.id,
    maxSupply:     maxSupply as bigint,
    totalMinted:   0,
    tradingLocked: false,
    revealed:      false,
    baseURI:       null,
    createdAt:     event.block.timestamp,
    phaseCount:    0,
  });
});

// ── Collection events ─────────────────────────────────────────────────────────

// PhaseAdded — creator called addPhase(). Read full phase data and insert.
ponder.on("Collection:PhaseAdded", async ({ event, context }) => {
  const collectionId = event.log.address;
  const phaseId      = Number(event.args.phaseId);
  const client       = context.client;

  const phase = await client.readContract({
    abi:          context.contracts.Collection.abi,
    address:      collectionId,
    functionName: "getPhase",
    args:         [BigInt(phaseId)],
  }) as {
    name: string;
    startTime: bigint;
    endTime: bigint;
    price: bigint;
    maxPerWallet: number;
    maxSupply: number;
    merkleRoot: `0x${string}`;
    active: boolean;
  };

  await context.db.insert(phases).values({
    id:           `${collectionId}-${phaseId}`,
    collectionId,
    phaseId,
    name:         phase.name,
    price:        phase.price,
    startTime:    phase.startTime,
    endTime:      phase.endTime,
    maxPerWallet: phase.maxPerWallet,
    maxSupply:    phase.maxSupply,
    merkleRoot:   phase.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ? null
                    : phase.merkleRoot,
    active:       phase.active,
    mintedCount:  0,
  });

  // Increment denormalised phase count on the collection
  await context.db
    .update(collections, { id: collectionId })
    .set((row) => ({ phaseCount: row.phaseCount + 1 }));
});

// PhaseUpdated — creator called setPhase() / setPhaseActive() / setPhasePrice().
// Re-read and overwrite phase row.
ponder.on("Collection:PhaseUpdated", async ({ event, context }) => {
  const collectionId = event.log.address;
  const phaseId      = Number(event.args.phaseId);
  const client       = context.client;

  const phase = await client.readContract({
    abi:          context.contracts.Collection.abi,
    address:      collectionId,
    functionName: "getPhase",
    args:         [BigInt(phaseId)],
  }) as {
    name: string;
    startTime: bigint;
    endTime: bigint;
    price: bigint;
    maxPerWallet: number;
    maxSupply: number;
    merkleRoot: `0x${string}`;
    active: boolean;
  };

  await context.db
    .update(phases, { id: `${collectionId}-${phaseId}` })
    .set({
      name:         phase.name,
      price:        phase.price,
      startTime:    phase.startTime,
      endTime:      phase.endTime,
      maxPerWallet: phase.maxPerWallet,
      maxSupply:    phase.maxSupply,
      merkleRoot:   phase.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000"
                      ? null
                      : phase.merkleRoot,
      active:       phase.active,
    });
});

// Minted — emitted once per mint() call (covers quantity > 1 as a batch).
// The event gives startTokenId so we can expand into individual token rows.
ponder.on("Collection:Minted", async ({ event, context }) => {
  const collectionId  = event.log.address;
  const { minter, phaseId, quantity, startTokenId } = event.args;
  const phaseIdNum    = Number(phaseId);
  const qty           = Number(quantity);

  // Insert one mint row per token in the batch
  const mintRows = Array.from({ length: qty }, (_, i) => ({
    id:           `${event.transaction.hash}-${event.log.logIndex}-${i}`,
    collectionId,
    tokenId:      startTokenId + BigInt(i),
    minter,
    phaseId:      phaseIdNum,
    txHash:       event.transaction.hash,
    mintedAt:     event.block.timestamp,
  }));

  for (const row of mintRows) {
    await context.db.insert(mints).values(row);
  }

  // Update phase mintedCount
  await context.db
    .update(phases, { id: `${collectionId}-${phaseIdNum}` })
    .set((row) => ({ mintedCount: row.mintedCount + qty }));

  // Update collection totalMinted
  await context.db
    .update(collections, { id: collectionId })
    .set((row) => ({ totalMinted: row.totalMinted + qty }));
});

// Transfer — emitted for every token movement including mints (from = 0x0).
// Skip mint transfers (from === zero address) to avoid double-counting.
ponder.on("Collection:Transfer", async ({ event, context }) => {
  const ZERO = "0x0000000000000000000000000000000000000000";
  if (event.args.from.toLowerCase() === ZERO) return;

  await context.db.insert(transfers).values({
    id:           `${event.transaction.hash}-${event.log.logIndex}`,
    collectionId: event.log.address,
    tokenId:      event.args.tokenId,
    from:         event.args.from,
    to:           event.args.to,
    txHash:       event.transaction.hash,
    timestamp:    event.block.timestamp,
  });
});

// TradingLockChanged — creator called lockTrading() or unlockTrading()
ponder.on("Collection:TradingLockChanged", async ({ event, context }) => {
  await context.db
    .update(collections, { id: event.log.address })
    .set({ tradingLocked: event.args.locked });
});

// Revealed — creator called reveal(baseURI). Read baseURI and mark revealed.
ponder.on("Collection:Revealed", async ({ event, context }) => {
  const collectionId = event.log.address;

  const baseURI = await context.client.readContract({
    abi:          context.contracts.Collection.abi,
    address:      collectionId,
    functionName: "baseURI",
  }) as string;

  await context.db
    .update(collections, { id: collectionId })
    .set({ revealed: true, baseURI });
});
