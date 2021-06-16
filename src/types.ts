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

export type Message = {
  type: 'init' | 'get-nodes' | 'confirm' | 'save-url';
}

export type MessageInit = Message & {}

export type MessageConfirm = Message & {
  items: string[];
  groupingKey: string;
  casing: Casing;
  prepend: string;
  append: string;
}

export type MessageUrl = Message & {
  url: string;
}
