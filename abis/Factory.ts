// Real Factory ABI — Sepolia v3
// Source: contracts.ts in the Kovari frontend (confirmed against Blockscout)
// Only events are needed for Ponder; read/write functions omitted for brevity.
export const FactoryAbi = [
  {
    type: "event",
    name: "CollectionCreated",
    inputs: [
      { name: "collection", type: "address", indexed: true },
      { name: "creator",    type: "address", indexed: true },
      { name: "name",       type: "string",  indexed: false },
      { name: "symbol",     type: "string",  indexed: false },
    ],
  },
  {
    type: "event",
    name: "PlatformFeeUpdated",
    inputs: [{ name: "newFee", type: "uint256", indexed: false }],
  },
  {
    type: "event",
    name: "PlatformFeeRecipientUpdated",
    inputs: [{ name: "newRecipient", type: "address", indexed: false }],
  },
  // Read functions needed by Ponder handlers
  {
    type: "function",
    name: "totalCollections",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFlatFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
