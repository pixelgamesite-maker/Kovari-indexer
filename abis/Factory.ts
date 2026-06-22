// TODO: replace this entire file with the real compiled ABI from the
// contract dev (usually a JSON artifact from Foundry/Hardhat). This is a
// minimal placeholder so the project type-checks before the real contract
// exists - it will NOT correctly index anything until swapped out.
export const FactoryAbi = [
  {
    type: "event",
    name: "CollectionCreated",
    inputs: [
      { name: "collection", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
] as const;
