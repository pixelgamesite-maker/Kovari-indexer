import { onchainTable, index } from "ponder";

export const collections = onchainTable(
  "collections",
  (t) => ({
    id: t.hex().primaryKey(), // collection contract address
    creator: t.hex().notNull(),
    name: t.text().notNull(),
    chainId: t.integer().notNull(),
    tradingLocked: t.boolean().notNull().default(false),
    totalSupply: t.integer().notNull().default(0),
    createdAt: t.bigint().notNull(),
  }),
  (table) => ({
    creatorIdx: index().on(table.creator),
  })
);

export const phases = onchainTable(
  "phases",
  (t) => ({
    id: t.text().primaryKey(), // `${collectionId}-${phaseIndex}`
    collectionId: t.hex().notNull(),
    phaseIndex: t.integer().notNull(),
    merkleRoot: t.hex(),
    cap: t.integer().notNull(),
    mintedCount: t.integer().notNull().default(0),
    price: t.bigint().notNull(),
    startTime: t.bigint(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
  })
);

export const mints = onchainTable(
  "mints",
  (t) => ({
    id: t.text().primaryKey(), // `${txHash}-${logIndex}`
    collectionId: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    phaseIndex: t.integer().notNull(),
    txHash: t.hex().notNull(),
    mintedAt: t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
    ownerIdx: index().on(table.owner),
  })
);

export const transfers = onchainTable(
  "transfers",
  (t) => ({
    id: t.text().primaryKey(), // `${txHash}-${logIndex}`
    collectionId: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    txHash: t.hex().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
    tokenIdx: index().on(table.tokenId),
  })
);
