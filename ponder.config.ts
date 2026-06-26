import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";

import { FactoryAbi } from "./abis/Factory";
import { CollectionAbi } from "./abis/Collection";

// Sepolia v3 — confirmed against Blockscout
// "0x89e9..." is labeled Factory, "0x7131..." is the Collection implementation
const FACTORY_ADDRESS = "0x89e9D5d21Ba5ef773702dDA42269064510324A30" as const;

// Block the Factory was deployed on Sepolia.
// TODO: look this up on Sepolia Etherscan/Blockscout and set the real value —
// starting from 0 works but wastes time scanning thousands of empty blocks.
// Find it: https://sepolia.etherscan.io/address/0x89e9D5d21Ba5ef773702dDA42269064510324A30
const FACTORY_START_BLOCK = 0;

export default createConfig({
  chains: {
    // Sepolia testnet — the only deployed chain right now (brief §2)
    sepolia: {
      id: 11155111,
      rpc: http(process.env.PONDER_RPC_URL_11155111),
    },
    // Mainnet + Base ready for when contracts deploy there
    // mainnet: { id: 1, rpc: http(process.env.PONDER_RPC_URL_1) },
    // base:    { id: 8453, rpc: http(process.env.PONDER_RPC_URL_8453) },
  },
  contracts: {
    // The factory — catches CollectionCreated to bootstrap each collection row
    Factory: {
      abi: FactoryAbi,
      chain: "sepolia",
      address: FACTORY_ADDRESS,
      startBlock: FACTORY_START_BLOCK,
    },
    // Every collection clone deployed by the factory.
    // Ponder watches CollectionCreated and auto-starts indexing each child.
    Collection: {
      abi: CollectionAbi,
      chain: "sepolia",
      address: factory({
        address: FACTORY_ADDRESS,
        // Real event signature from the ABI — includes name + symbol args
        event: parseAbiItem(
          "event CollectionCreated(address indexed collection, address indexed creator, string name, string symbol)"
        ),
        parameter: "collection",
      }),
      startBlock: FACTORY_START_BLOCK,
    },
  },
});
