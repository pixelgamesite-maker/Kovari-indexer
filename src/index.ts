import { ponder } from "ponder:registry";
import { collection, phase, mint, transfer } from "ponder:schema";

// ── Factory events ────────────────────────────────────────────────────────────

ponder.on("Factory:CollectionCreated", async ({ event, context }) => {
  const address = event.args.collection;
  const client  = context.client;

  // symbol comes directly from event.args — no extra RPC call needed
  const maxSupply = await client.readContract({
    abi:          context.contracts.Collection.abi,
    address,
    functionName: "maxSupply",
  });

  await context.db.insert(collection).values({
    id:            address,
    creator:       event.args.creator,
    name:          event.args.name,
    symbol:        event.args.symbol,
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

  const phaseData = await client.readContract({
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

  await context.db.insert(phase).values({
    id:           `${collectionId}-${phaseId}`,
    collectionId,
    phaseId,
    name:         phaseData.name,
    price:        phaseData.price,
    startTime:    phaseData.startTime,
    endTime:      phaseData.endTime,
    maxPerWallet: phaseData.maxPerWallet,
    maxSupply:    phaseData.maxSupply,
    merkleRoot:   phaseData.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ? null
                    : phaseData.merkleRoot,
    active:       phaseData.active,
    mintedCount:  0,
  });

  await context.db
    .update(collection, { id: collectionId })
    .set((row) => ({ phaseCount: row.phaseCount + 1 }));
});

ponder.on("Collection:PhaseUpdated", async ({ event, context }) => {
  const collectionId = event.log.address;
  const phaseId      = Number(event.args.phaseId);
  const client       = context.client;

  const phaseData = await client.readContract({
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
    .update(phase, { id: `${collectionId}-${phaseId}` })
    .set({
      name:         phaseData.name,
      price:        phaseData.price,
      startTime:    phaseData.startTime,
      endTime:      phaseData.endTime,
      maxPerWallet: phaseData.maxPerWallet,
      maxSupply:    phaseData.maxSupply,
      merkleRoot:   phaseData.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000"
                      ? null
                      : phaseData.merkleRoot,
      active:       phaseData.active,
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
    await context.db.insert(mint).values(row);
  }

  // Update phase mintedCount
  await context.db
    .update(phase, { id: `${collectionId}-${phaseIdNum}` })
    .set((row) => ({ mintedCount: row.mintedCount + qty }));

  // Update collection totalMinted
  await context.db
    .update(collection, { id: collectionId })
    .set((row) => ({ totalMinted: row.totalMinted + qty }));
});

// Transfer — emitted for every token movement including mints (from = 0x0).
// Skip mint transfers (from === zero address) to avoid double-counting.
ponder.on("Collection:Transfer", async ({ event, context }) => {
  const ZERO = "0x0000000000000000000000000000000000000000";
  if (event.args.from.toLowerCase() === ZERO) return;

  await context.db.insert(transfer).values({
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
    .update(collection, { id: event.log.address })
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
    .update(collection, { id: collectionId })
    .set({ revealed: true, baseURI });
});
