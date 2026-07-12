import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";
import { FactoryAbi } from "./abis/Factory";
import { CollectionAbi } from "./abis/Collection";

// Mainnet Factory — confirmed from Etherscan
// Deployed by 0xC0058301b89d8AaF5224981BB42e2Ae2b1EdBac9
const FACTORY_ADDRESS = "0xe74Fc9b52ee847cf0A3CEc2f7bfD5DC7175F7BE5" as const;

// TODO: replace with the actual deployment block from Etherscan.
// Open https://etherscan.io/address/0xe74Fc9b52ee847cf0A3CEc2f7bfD5DC7175F7BE5
// and look at the contract creation transaction block number.
// Using the real block instead of 0 makes the initial sync much faster.
const FACTORY_START_BLOCK = 0;

export default createConfig({
  server: {
    port: Number(process.env.PORT ?? 8080),
    host: "0.0.0.0",
  },
  chains: {
    mainnet: {
      id: 1,
      rpc: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Factory: {
      abi: FactoryAbi,
      chain: "mainnet",
      address: FACTORY_ADDRESS,
      startBlock: FACTORY_START_BLOCK,
    },
    Collection: {
      abi: CollectionAbi,
      chain: "mainnet",
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
