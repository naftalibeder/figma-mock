import { writable } from '../node_modules/svelte/store/index';
import { CachedStore } from "types";
import { defaultTextBlockCustomString } from './constants';

export const store = writable<CachedStore>({
  nodeGroups: [],
  listGroups: [],
  textBlocks: [defaultTextBlockCustomString()],
});