import { Casing, ListType, Sort } from "./enums";

export interface InputConfigBase {
  id: string;
  title: string;
  listId: string;
  sort: Sort;
  confirmed: boolean;
}

export type InputConfig = InputConfigString | InputConfigNumber | InputConfigDate;

export interface InputConfigString extends InputConfigBase {
  readonly type: "InputConfigString";
  url: string;
  casing: Casing;
}

export interface InputConfigNumber extends InputConfigBase {
  readonly type: "InputConfigNumber";
  min: number;
  max: number;
  decimals: number;
}

export interface InputConfigDate extends InputConfigBase {
  readonly type: "InputConfigDate";
  earliest: Date;
  latest: Date;
  format: string;
}

export interface ListResponse {
  baseUrl: string;
  name?: string;
  lists?: ListResponseList[];
  error?: string;
}

export interface ListResponseList {
  name: string;
  path?: string;
  url?: string;
  type?: ListType;
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
