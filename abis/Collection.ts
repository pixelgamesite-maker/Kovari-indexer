// TODO: replace this entire file with the real compiled ABI for the
// collection template contract. Event names below (Minted, Transfer,
// TradingLockChanged) are placeholders based on what we discussed needing -
// confirm exact names/params with the contract dev before relying on these.
export const CollectionAbi = [
  {
    type: "event",
    name: "Minted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "phaseIndex", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TradingLockChanged",
    inputs: [{ name: "locked", type: "bool", indexed: false }],
  },
] as const;
