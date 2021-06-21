import { Casing, ListType, Sort } from "./enums";

export interface InputConfig {
  id: string;
  title: string;
  listId: string;
  confirmed: boolean;
}

export interface InputStringConfig extends InputConfig {
  casing: Casing;
  sort: Sort;
}

export interface InputNumberConfig extends InputConfig {
  min: number;
  max: number;
  decimals: number;
  sort: Sort;
}

export interface InputDateConfig extends InputConfig {
  earliest: Date;
  latest: Date;
  format: string;
  sort: Sort;
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
}

export type WindowMessageUrl = WindowMessage & {
  url: string;
}
