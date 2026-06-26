import { onchainTable, index } from "ponder";

// ── collections ───────────────────────────────────────────────────────────────
// One row per Factory:CollectionCreated event.
// Read functions called at creation time fill name/symbol/maxSupply.
export const collections = onchainTable(
  "collections",
  (t) => ({
    id:           t.hex().primaryKey(),   // collection contract address
    creator:      t.hex().notNull(),
    name:         t.text().notNull(),
    symbol:       t.text().notNull().default(""),
    chainId:      t.integer().notNull(),
    maxSupply:    t.bigint().notNull().default(0n),
    totalMinted:  t.integer().notNull().default(0),
    tradingLocked:t.boolean().notNull().default(false),
    revealed:     t.boolean().notNull().default(false),
    // Set after reveal() is called on the collection
    baseURI:      t.text(),
    createdAt:    t.bigint().notNull(),
    // Denormalised phase count — incremented by PhaseAdded handler
    phaseCount:   t.integer().notNull().default(0),
  }),
  (table) => ({
    creatorIdx: index().on(table.creator),
    chainIdx:   index().on(table.chainId),
  })
);

// ── phases ────────────────────────────────────────────────────────────────────
// Populated/updated by PhaseAdded + PhaseUpdated events via getPhase() read.
export const phases = onchainTable(
  "phases",
  (t) => ({
    id:           t.text().primaryKey(),  // `${collectionId}-${phaseId}`
    collectionId: t.hex().notNull(),
    phaseId:      t.integer().notNull(),  // on-chain index (0-based)
    name:         t.text().notNull().default(""),
    price:        t.bigint().notNull().default(0n),
    startTime:    t.bigint().notNull().default(0n),
    endTime:      t.bigint().notNull().default(0n),   // 0 = no end
    maxPerWallet: t.integer().notNull().default(0),   // 0 = unlimited
    maxSupply:    t.integer().notNull().default(0),   // 0 = no cap
    merkleRoot:   t.hex(),
    active:       t.boolean().notNull().default(false),
    mintedCount:  t.integer().notNull().default(0),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
  })
);

// ── mints ─────────────────────────────────────────────────────────────────────
// One row per NFT minted (quantity > 1 → multiple rows, one per tokenId)
export const mints = onchainTable(
  "mints",
  (t) => ({
    id:           t.text().primaryKey(), // `${txHash}-${logIndex}-${tokenId}`
    collectionId: t.hex().notNull(),
    tokenId:      t.bigint().notNull(),
    minter:       t.hex().notNull(),
    phaseId:      t.integer().notNull(),
    txHash:       t.hex().notNull(),
    mintedAt:     t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
    minterIdx:     index().on(table.minter),
    tokenIdx:      index().on(table.tokenId),
  })
);

// ── transfers ─────────────────────────────────────────────────────────────────
// Every ERC-721 Transfer event (mints produce a Transfer from 0x0 too,
// so we filter those out in the handler to avoid double-counting).
export const transfers = onchainTable(
  "transfers",
  (t) => ({
    id:           t.text().primaryKey(), // `${txHash}-${logIndex}`
    collectionId: t.hex().notNull(),
    tokenId:      t.bigint().notNull(),
    from:         t.hex().notNull(),
    to:           t.hex().notNull(),
    txHash:       t.hex().notNull(),
    timestamp:    t.bigint().notNull(),
  }),
  (table) => ({
    collectionIdx: index().on(table.collectionId),
    tokenIdx:      index().on(table.tokenId),
    fromIdx:       index().on(table.from),
    toIdx:         index().on(table.to),
  })
);
