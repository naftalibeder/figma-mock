type UUID = string;

export type CachedStore = {
  nodeGroups: TextNodeGroup[];
  listGroups: ListGroup[];
  textBlocks: TextBlock[];
};

export type PersistedStore = {
  listUrls: Record<UUID, string[]>;
  textBlocks: Record<UUID, TextBlock[]>;
};

export type ListKind =
  | "TextBlockString"
  | "TextBlockNumber"
  | "TextBlockDate"
  | "TextBlockCustomString";

export type Casing = "original" | "sentence" | "title" | "upper" | "lower";

export type Sort = "original" | "random" | "ascending" | "descending";

export interface TextBlockBase {
  readonly type: ListKind;
  id: UUID;
  title: string;
  listId: UUID;
  sort: Sort;
  confirmed: boolean;
}

export type TextBlock = TextBlockString | TextBlockNumber | TextBlockDate | TextBlockCustomString;

export interface TextBlockString extends TextBlockBase {
  readonly type: "TextBlockString";
  url: string;
  casing: Casing;
}

export interface TextBlockNumber extends TextBlockBase {
  readonly type: "TextBlockNumber";
  min: number;
  max: number;
  decimals: number;
}

export interface TextBlockDate extends TextBlockBase {
  readonly type: "TextBlockDate";
  earliest: Date;
  latest: Date;
  format: string;
}

export interface TextBlockCustomString extends TextBlockBase {
  readonly type: "TextBlockCustomString";
  customText: string;
}

export interface ListGroup {
  baseUrl: string;
  name?: string;
  lists?: ListGroupList[];
  error?: string;
}

export interface ListGroupList {
  id: UUID;
  name: string;
  path?: string;
  url?: string;
  type?: ListKind;
}

export interface TextNodeInfo {
  id: UUID;
  characters: string;
}

export class TextNodeGroup {
  key: string;
  nodesMap: { [id: string]: TextNodeInfo };
  count: number;

  constructor(key: string) {
    this.key = key;
    this.nodesMap = {};
    this.count = 0;
  }
}

export type CodeMessage = CodeMessageSelectedAndStore | CodeMessageSelected;

export type CodeMessageSelectedAndStore = {
  readonly type: "SELECTED_AND_STORE";
  nodeGroups: TextNodeGroup[];
  persistedStore: PersistedStore;
};

export type CodeMessageSelected = {
  readonly type: "SELECTED";
  nodeGroups: TextNodeGroup[];
};

export type WindowMessage =
  | WindowMessageGetSelectedAndStore
  | WindowMessageGetSelected
  | WindowMessageSetStore
  | WindowMessagePaste
  | WindowMessageExit;

export type WindowMessageGetSelectedAndStore = {
  readonly type: "GET_SELECTED_AND_STORE";
};

export type WindowMessageGetSelected = {
  readonly type: "GET_SELECTED";
};

export type WindowMessageSetStore = {
  readonly type: "SET_STORE";
  persistedStore: PersistedStore;
};

export type WindowMessagePaste = {
  readonly type: "PASTE";
  textLinesMap: Record<string, string>;
};

export type WindowMessageExit = {
  readonly type: "EXIT";
};

export type SelectMenuOption<T = any> = {
  value: T;
  label: string;
  group?: string;
  selected: boolean;
};
