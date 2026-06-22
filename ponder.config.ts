import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";

// NOTE: Ponder's config API shifts between versions (networks/network vs
// chains/chain naming has changed across releases). If `ponder dev` throws a
// type error on this file, check https://ponder.sh/docs/config/contracts
// against whatever version `npm install` actually pulled in.

// TODO: replace with the real Factory contract ABI once the contract dev
// delivers it. Only the ABI fragment needed to extract child addresses is
// required here - factory() just needs to find the event that announces a
// new collection clone.
import { FactoryAbi } from "./abis/Factory";
import { CollectionAbi } from "./abis/Collection";

const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO
const FACTORY_START_BLOCK = 0; // TODO: block the factory was actually deployed at

export default createConfig({
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
    // The factory itself - lets us catch the CollectionCreated event and run
    // setup logic (inserting the new row into `collections`).
    Factory: {
      abi: FactoryAbi,
      chain: "base", // TODO: add a second entry here (or array) once you support launches on both chains
      address: FACTORY_ADDRESS,
      startBlock: FACTORY_START_BLOCK,
    },
    // Every collection deployed *by* the factory. Ponder watches for the
    // factory's announcement event and automatically starts indexing each
    // child contract's own events (Minted, Transfer, TradingLockChanged, etc).
    Collection: {
      abi: CollectionAbi,
      chain: "base",
      address: factory({
        address: FACTORY_ADDRESS,
        // TODO: confirm exact event name/signature with the contract dev
        event: parseAbiItem(
          "event CollectionCreated(address indexed collection, address indexed creator)"
        ),
        parameter: "collection",
      }),
      startBlock: FACTORY_START_BLOCK,
    },
  },
});
