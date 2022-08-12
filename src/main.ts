
import { defaultTextBlockCustomString } from "./constants";
import {
  WindowMessage,
  CodeMessageSelectedAndStore,
  CodeMessageSelected,
  PersistedStore,
  TextNodeInfo,
} from "./types";

figma.showUI(__html__, { width: 360, height: 720 });

const buildNodeInfos = (nodes: TextNode[]): TextNodeInfo[] => {
  return nodes.map(o => {
    return {
      id: o.id,
      name: o.name,
      characters: o.characters,
      x: o.x,
      y: o.y,
    }
  })
}

const refreshEverything = async () => {
  const nodes = getAllSelectedTextNodes();
  const nodeInfos = buildNodeInfos(nodes);
  const persistedStore = await getStore();
  const message: CodeMessageSelectedAndStore = { type: 'SELECTED_AND_STORE', nodeInfos, persistedStore };
  figma.ui.postMessage(message);
};

const refreshSelectedNodes = async () => {
  const nodes = getAllSelectedTextNodes();
  const nodeInfos = buildNodeInfos(nodes);
  const message: CodeMessageSelected = { type: 'SELECTED', nodeInfos };
  figma.ui.postMessage(message);
};

const writeToNodes = async (textLinesMap: Record<string, string>) => {
  let textNodes: TextNode[] = [];
  for (const [textNodeId, _] of Object.entries(textLinesMap)) {
    textNodes.push(figma.getNodeById(textNodeId) as TextNode)
  }

  // Preload all fonts needed to edit the selected nodes.

  const fontNameMap: Record<string, FontName> = {};
  for (const textNode of textNodes) {
    const fontName = textNode.fontName as FontName;
    const fontId = `${fontName.family}-${fontName.style}`;
    fontNameMap[fontId] = fontName;
  }
  const fontNames = Object.values(fontNameMap);

  for (const fontName of fontNames) {
    try {
      await figma.loadFontAsync(fontName);
    } catch (e) {
      console.warn("Error loading text node font:", e);
    }
  }

  // Paste text into all selected nodes.

  for (const textNode of textNodes) {
    textNode.characters = textLinesMap[textNode.id];
  }

  refreshSelectedNodes();
};

const appendChildTextNodes = (nodes: TextNode[], node: BaseNode) => {
  if (
    node.type === "FRAME" ||
    node.type === "GROUP" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    node.children.forEach((node) => appendChildTextNodes(nodes, node));
  } else if (node.type === "TEXT") {
    nodes.push(node);
  }
};

const getAllSelectedTextNodes = (): TextNode[] => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;
  let all: TextNode[] = [];
  selectedNodes.forEach((node) => appendChildTextNodes(all, node));
  return all;
};

const getStore = async (): Promise<PersistedStore> => {
  const defaultListGroupUrl = 'https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json';

  try {
    const storeStr = await figma.clientStorage.getAsync("store");
    const store = JSON.parse(storeStr) as PersistedStore;
    console.log('Fetched store:', store);

    if (Object.keys(store).length === 0) {
      throw 'Persisted store is empty';
    }

    let listGroupUrls = store.listGroupUrls;
    if (listGroupUrls.length === 0) {
      listGroupUrls = [defaultListGroupUrl];
    }

    let textBlocks = store.textBlocks;
    if (textBlocks.length === 0) {
      textBlocks = [defaultTextBlockCustomString()];
    }

    return {
      nodeGroupKind: store.nodeGroupKind,
      listGroupUrls,
      textBlocks,
    };
  } catch (e) {
    console.log('Error fetching store:', e);

    return {
      nodeGroupKind: 'NAME',
      listGroupUrls: [defaultListGroupUrl],
      textBlocks: [defaultTextBlockCustomString()],
    };
  }
};

const setStore = async (store: PersistedStore) => {
  const storeStr = JSON.stringify(store);
  await figma.clientStorage.setAsync("store", storeStr);
  console.log('Saved store:', store);
};

figma.ui.onmessage = async (message: WindowMessage) => {
  const { type } = message;

  if (type === 'GET_SELECTED_AND_STORE') {
    refreshEverything();
  } else if (type === 'GET_SELECTED') {
    refreshSelectedNodes();
  } else if (type === 'SET_STORE') {
    setStore(message.persistedStore);
  } else if (type === 'PASTE') {
    writeToNodes(message.textLinesMap)
  } else if (type === 'EXIT') {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshSelectedNodes();
});
