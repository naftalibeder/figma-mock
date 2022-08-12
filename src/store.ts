import { writable } from '../node_modules/svelte/store/index';
import { CachedStore, PersistedStore, WindowMessageSetStore } from "types";

export const store = writable<CachedStore>({
  loaded: false,
  nodeGroupKind: undefined,
  nodeGroups: [],
  listGroups: [],
  textBlocks: [],
});

store.subscribe((s) => {
  if (!s.loaded) {
    return;
  }

  const listGroupUrls: string[] = [];
  s.listGroups.forEach(group => {
    if (group.indexUrl) {
      listGroupUrls.push(group.indexUrl);
    }
  })

  const persistedStore: PersistedStore = {
    nodeGroupKind: s.nodeGroupKind,
    listGroupUrls,
    textBlocks: s.textBlocks,
  }

  const message: WindowMessageSetStore = {
    type: 'SET_STORE',
    persistedStore,
  }
  parent.postMessage({ pluginMessage: message }, "*");
})