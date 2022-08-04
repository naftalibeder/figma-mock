import { writable } from "svelte/store";
import { defaultTextBlockCustomString } from "./constants";
import { TextNodeGroup, ListGroup, TextBlock } from "types";

type Store = {
  nodeGroups: TextNodeGroup[];
  listGroups: ListGroup[];
  textBlocks: TextBlock[];
};

const defaultStore = {
  nodeGroups: [],
  listGroups: [],
  textBlocks: [defaultTextBlockCustomString()],
};

// const setInitialStore = async () => {
//   try {
//     const _storeStr = await figma.clientStorage.getAsync("store");
//     const _store = JSON.parse(_storeStr) as Store;
//     store.set(_store);
//   } catch (e) {
//     store.set(defaultStore);
//   }
// };

export const store = writable<Store>(defaultStore);

store.subscribe(async (_store) => {
  console.log('store:', _store);

  // const _storeStr = JSON.stringify(_store);
  // await figma.clientStorage.setAsync("store", _storeStr);
});