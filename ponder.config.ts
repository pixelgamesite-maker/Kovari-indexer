import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";
import { FactoryAbi } from "./abis/Factory";
import { CollectionAbi } from "./abis/Collection";

const FACTORY_ADDRESS = "0x89e9D5d21Ba5ef773702dDA42269064510324A30" as const;

// Set this to the block your Factory was deployed at - check Etherscan for
// the contract creation tx block number. Indexing from 0 works but is slow.
const FACTORY_START_BLOCK = 7000000;

export default createConfig({
  server: {
    port: Number(process.env.PORT ?? 8080),
    host: "0.0.0.0",
  },
  chains: {
    sepolia: {
      id: 11155111,
      rpc: http(process.env.PONDER_RPC_URL_11155111),
    },
  },
  contracts: {
    Factory: {
      abi: FactoryAbi,
      chain: "sepolia",
      address: FACTORY_ADDRESS,
      startBlock: FACTORY_START_BLOCK,
    },
    Collection: {
      abi: CollectionAbi,
      chain: "sepolia",
      address: factory({
        address: FACTORY_ADDRESS,
        event: parseAbiItem(
          "event CollectionCreated(address indexed collection, address indexed creator, string name, string symbol)"
        ),
        parameter: "collection",
      }),
      startBlock: FACTORY_START_BLOCK,
    },
  },
});
