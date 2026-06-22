# Kovari indexer

Ponder project that watches the launchpad factory + every collection it
deploys, and writes indexed data into Postgres (Neon) for the frontend to
query via auto-generated GraphQL.

## What's real right now

- `ponder.schema.ts` - the four core tables (`collections`, `phases`,
  `mints`, `transfers`), matching the data model we've been building the
  frontend against.
- Project structure, config shape, and the factory-pattern setup for
  indexing dynamically-deployed collection clones.

## What's a placeholder, waiting on the contract

- `abis/Factory.ts` and `abis/Collection.ts` - minimal fake ABIs, just
  enough for the project to type-check. **Will not correctly index
  anything** until replaced with the real compiled ABI.
- `FACTORY_ADDRESS` and `FACTORY_START_BLOCK` in `ponder.config.ts` - both
  zero/placeholder.
- Event names in `src/index.ts` (`CollectionCreated`, `Minted`, `Transfer`,
  `TradingLockChanged`) - best guesses based on what we discussed needing.
  **Confirm exact names and argument names with the contract dev** before
  trusting these - a mismatched argument name fails silently differently
  than a missing export does, so double-check carefully.

## Setup

```
npm install
cp .env.example .env.local   # fill in your Neon connection string + RPC URLs
npm run dev
```

`ponder dev` starts a local dev server with hot reload and a GraphQL
playground at http://localhost:42069 - use it to confirm events are landing
in the right tables before trusting the indexer in production.

## Once the real contract lands

1. Replace `abis/Factory.ts` and `abis/Collection.ts` with the real
   compiled ABI (usually a JSON artifact from Foundry/Hardhat).
2. Set `FACTORY_ADDRESS` to the real deployed address.
3. Set `FACTORY_START_BLOCK` to the block it was deployed at (don't use 0 -
   indexing from genesis is needlessly slow).
4. Update event names/args in `src/index.ts` to match exactly.
5. Run `npm run codegen` to regenerate types, then `npm run dev` again to
   confirm it's actually picking up real events.

## Deploying

Runs as its own long-lived Railway service (`npm run start`, not `dev`) -
separate from the frontend, since it needs to index continuously rather
than respond to requests. Set `DATABASE_URL` and the RPC URLs as Railway
environment variables, same as the frontend's Alchemy key setup.
