export type ListKind =
  | "TextBlockString"
  | "TextBlockNumber"
  | "TextBlockDate"
  | "TextBlockCustomString";

export type Casing = "original" | "sentence" | "title" | "upper" | "lower";

export type Sort = "original" | "random" | "ascending" | "descending";

export interface TextBlockBase {
  readonly type: ListKind;
  id: string;
  title: string;
  listId: string;
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
  id: string;
  name: string;
  path?: string;
  url?: string;
  type?: ListKind;
}

export interface TextNodeInfo {
  id: string;
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

export type CodeMessage = CodeMessageInit | CodeMessageGetNodes;

export type CodeMessageInit = {
  readonly type: "INIT";
  url: string;
  nodeGroups: TextNodeGroup[];
};

export type CodeMessageGetNodes = {
  readonly type: "NODES";
  nodeGroups: TextNodeGroup[];
};

export type WindowMessage =
  | WindowMessageInit
  | WindowMessageConfirm
  | WindowMessageGetNodes
  | WindowMessageUrl
  | WindowMessageCancel;

export type WindowMessageInit = {
  readonly type: "INIT";
};

export type WindowMessageConfirm = {
  readonly type: "CONFIRM";
  itemsSequence: string[][];
  groupingKey: string;
};

export type WindowMessageGetNodes = {
  readonly type: "GET_NODES";
};

export type WindowMessageUrl = {
  readonly type: "URL";
  url: string;
};

export type WindowMessageCancel = {
  readonly type: "CANCEL";
};

export type SelectMenuOption<T = any> = {
  value: T;
  label: string;
  group?: string;
  selected: boolean;
};
