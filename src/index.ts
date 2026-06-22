import { ponder } from "ponder:registry";
import { collections, phases, mints, transfers } from "ponder:schema";

// TODO: every event name/argument below is a placeholder based on what we
// discussed needing from the contract dev. Once the real ABI lands, confirm
// these match exactly - argument names in particular are easy to get wrong.

ponder.on("Factory:CollectionCreated", async ({ event, context }) => {
  await context.db.insert(collections).values({
    id: event.args.collection,
    creator: event.args.creator,
    name: "", // TODO: populate via context.client.readContract() if the
    // contract has a name() getter, or from an extra event arg if emitted
    chainId: context.chain.id,
    tradingLocked: false,
    totalSupply: 0,
    createdAt: event.block.timestamp,
  });
});

ponder.on("Collection:Minted", async ({ event, context }) => {
  await context.db.insert(mints).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    collectionId: event.log.address,
    tokenId: event.args.tokenId,
    owner: event.args.to,
    phaseIndex: event.args.phaseIndex,
    txHash: event.transaction.hash,
    mintedAt: event.block.timestamp,
  });

  await context.db
    .update(phases, { id: `${event.log.address}-${event.args.phaseIndex}` })
    .set((row) => ({ mintedCount: row.mintedCount + 1 }));
});

ponder.on("Collection:Transfer", async ({ event, context }) => {
  await context.db.insert(transfers).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    collectionId: event.log.address,
    tokenId: event.args.tokenId,
    from: event.args.from,
    to: event.args.to,
    txHash: event.transaction.hash,
    timestamp: event.block.timestamp,
  });
});

ponder.on("Collection:TradingLockChanged", async ({ event, context }) => {
  await context.db
    .update(collections, { id: event.log.address })
    .set({ tradingLocked: event.args.locked });
});
