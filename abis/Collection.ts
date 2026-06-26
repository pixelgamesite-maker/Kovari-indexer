// Real Collection ABI — Sepolia v3
// Source: contracts.ts in the Kovari frontend (confirmed against Blockscout)
// Includes all events Ponder needs to index + key read functions for handler logic.
export const CollectionAbi = [
  // ── Events ──────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "Minted",
    inputs: [
      { name: "minter",       type: "address", indexed: true  },
      { name: "phaseId",      type: "uint256", indexed: true  },
      { name: "quantity",     type: "uint256", indexed: false },
      { name: "startTokenId", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from",    type: "address", indexed: true },
      { name: "to",      type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "TradingLockChanged",
    inputs: [{ name: "locked", type: "bool", indexed: false }],
  },
  {
    type: "event",
    name: "PhaseAdded",
    inputs: [{ name: "phaseId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "PhaseUpdated",
    inputs: [{ name: "phaseId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "Revealed",
    inputs: [],
  },
  {
    type: "event",
    name: "TicketPhaseAdded",
    inputs: [{ name: "ticketPhaseId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "TicketsBought",
    inputs: [
      { name: "buyer",               type: "address", indexed: true  },
      { name: "ticketPhaseId",       type: "uint256", indexed: true  },
      { name: "quantity",            type: "uint256", indexed: false },
      { name: "totalTicketsForBuyer",type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TicketsFinalized",
    inputs: [
      { name: "ticketPhaseId", type: "uint256", indexed: true  },
      { name: "winnerCount",   type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "OwnerMinted",
    inputs: [
      { name: "to",           type: "address", indexed: true  },
      { name: "quantity",     type: "uint256", indexed: false },
      { name: "startTokenId", type: "uint256", indexed: false },
    ],
  },

  // ── Read functions used in Ponder handlers ───────────────────────────────
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "result", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalPhases",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPhase",
    inputs: [{ name: "phaseId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "name",        type: "string"  },
          { name: "startTime",   type: "uint64"  },
          { name: "endTime",     type: "uint64"  },
          { name: "price",       type: "uint256" },
          { name: "maxPerWallet",type: "uint32"  },
          { name: "maxSupply",   type: "uint32"  },
          { name: "merkleRoot",  type: "bytes32" },
          { name: "active",      type: "bool"    },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "phaseMinted",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "revealed",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tradingLocked",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "placeholderURI",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "baseURI",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;
