import { onchainTable, index } from "ponder";

export const collection = onchainTable(
  "collection",
  (t) => ({
    id: t.hex().primaryKey(),
    creator: t.hex().notNull(),
    name: t.text().notNull(),
    symbol: t.text().notNull(),
    chainId: t.integer().notNull(),
    maxSupply: t.bigint().notNull(),
    totalMinted: t.integer().notNull().default(0),
    tradingLocked: t.boolean().notNull().default(false),
    revealed: t.boolean().notNull().default(false),
    baseURI: t.text(),
    phaseCount: t.integer().notNull().default(0),
    createdAt: t.bigint().notNull(),
  }),
  (table) => ({
    creatorIdx: index().on(table.creator),
  })
);

export const phase = onchainTable(
  "phase",
  (t) => ({
    id: t.text().primaryKey(),
    collectionId: t.hex().notNull(),
    phaseId: t.integer().notNull(),
    name: t.text().notNull(),
    price: t.bigint().notNull(),
    startTime: t.bigint().notNull(),
    endTime: t.bigint().notNull(),
    maxPerWallet: t.integer().notNull(),
    maxSupply: t.integer().notNull(),
    merkleRoot: t.hex(),
    active: t.boolean().notNull(),
    mintedCount: t.integer().notNull().default(0),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
  })
);

export const mint = onchainTable(
  "mint",
  (t) => ({
    id: t.text().primaryKey(),
    collectionId: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    minter: t.hex().notNull(),
    phaseId: t.integer().notNull(),
    txHash: t.hex().notNull(),
    mintedAt: t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
    minterIdx: index().on(table.minter),
  })
);

export const transfer = onchainTable(
  "transfer",
  (t) => ({
    id: t.text().primaryKey(),
    collectionId: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    txHash: t.hex().notNull(),
    timestamp: t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
  })
);
