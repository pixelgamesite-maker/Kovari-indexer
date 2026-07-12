import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";
import { FactoryAbi } from "./abis/Factory";
import { CollectionAbi } from "./abis/Collection";

// Mainnet Factory — confirmed from Etherscan
// Deployed by 0xC0058301b89d8AaF5224981BB42e2Ae2b1EdBac9
const ETH_FACTORY = "0xe74Fc9b52ee847cf0A3CEc2f7bfD5DC7175F7BE5" as const;

// TODO: replace with actual deployment block from Etherscan for each chain.
// Syncing from 0 on mainnet will take a very long time.
const ETH_START_BLOCK = 0;
const BASE_START_BLOCK = 0;

// NOTE: BASE_FACTORY needs to be confirmed once the contract is deployed on Base.
// Using ETH_FACTORY as placeholder — update this before enabling Base indexing.
const BASE_FACTORY = "0xe74Fc9b52ee847cf0A3CEc2f7bfD5DC7175F7BE5" as const;

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
    base: {
      id: 8453,
      rpc: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    Factory: {
      abi: FactoryAbi,
      chain: "mainnet",
      address: ETH_FACTORY,
      startBlock: ETH_START_BLOCK,
    },
    BaseFactory: {
      abi: FactoryAbi,
      chain: "base",
      address: BASE_FACTORY,
      startBlock: BASE_START_BLOCK,
    },
    Collection: {
      abi: CollectionAbi,
      chain: "mainnet",
      address: factory({
        address: ETH_FACTORY,
        event: parseAbiItem(
          "event CollectionCreated(address indexed collection, address indexed creator, string name, string symbol)"
        ),
        parameter: "collection",
      }),
      startBlock: ETH_START_BLOCK,
    },
    BaseCollection: {
      abi: CollectionAbi,
      chain: "base",
      address: factory({
        address: BASE_FACTORY,
        event: parseAbiItem(
          "event CollectionCreated(address indexed collection, address indexed creator, string name, string symbol)"
        ),
        parameter: "collection",
      }),
      startBlock: BASE_START_BLOCK,
    },
  },
});
