import { Casing } from "./enums";

export interface TextNodeInfo {
  id: string,
  characters: string,
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

export type CodeMessage = {
  type: 'init' | 'nodes';
}

export type CodeMessageInit = CodeMessage & {
  url: string;
  nodeGroups: TextNodeGroup[];
}

export type CodeMessageGetNodes = CodeMessage & {
  nodeGroups: TextNodeGroup[];
}

export type WindowMessage = {
  type: 'init' | 'get-nodes' | 'confirm' | 'save-url';
}

export type WindowMessageInit = WindowMessage & {}

export type WindowMessageConfirm = WindowMessage & {
  items: string[];
  groupingKey: string;
  casing: Casing;
  prepend: string;
  append: string;
}

export type WindowMessageUrl = WindowMessage & {
  url: string;
}
