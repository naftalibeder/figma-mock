
import {
  WindowMessagePaste,
  TextNodeGroup,
  WindowMessage,
  CodeMessageSelectedAndStore,
  CodeMessageSelected,
  CachedStore,
  PersistedStore,
} from "./types";

figma.showUI(__html__, { width: 360, height: 720 });

const refreshEverything = async () => {
  const nodeGroups = getTextNodeGroups();
  const persistedStore = await getStore();
  const message: CodeMessageSelectedAndStore = { type: 'SELECTED_AND_STORE', nodeGroups, persistedStore };
  figma.ui.postMessage(message);
};

const refreshSelectedNodes = async () => {
  const nodeGroups = getTextNodeGroups();
  const message: CodeMessageSelected = { type: 'SELECTED', nodeGroups };
  figma.ui.postMessage(message);
};

const writeToNodes = (message: WindowMessagePaste) => {
  const { itemsSequence, groupingKey } = message;

  const textNodes: TextNode[] = getTextNodesWithGroupingKey(groupingKey);

  textNodes.forEach(async (textNode, index) => {
    if (!textNode.hasMissingFont) {
      await figma.loadFontAsync(textNode.fontName as FontName);

      let text = "";
      itemsSequence.forEach((items) => {
        const finalIndex = index % items.length;
        text += items[finalIndex];
      });
      textNode.characters = text;
    } else {
      console.log("Text node is missing a font and cannot be edited.");
    }

    if (index === textNodes.length - 1) {
      refreshSelectedNodes();
    }
  });
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

const getTextNodesWithGroupingKey = (key: string): TextNode[] => {
  const nodeGroups = getTextNodeGroups();
  const nodeGroup = nodeGroups.filter((group) => group.key == key)[0];
  const nodesInfos = Object.values(nodeGroup.nodesMap);
  const nodes = nodesInfos.map((o) => figma.getNodeById(o.id) as TextNode);
  return nodes;
};

const getTextNodeGroups = (): TextNodeGroup[] => {
  const nodes = getAllSelectedTextNodes();

  let groupsMap: { [key: string]: TextNodeGroup } = {};
  nodes.forEach((node) => {
    const groupingKey = `${node.x},${node.y}`;

    if (!groupsMap[groupingKey]) {
      groupsMap[groupingKey] = new TextNodeGroup(groupingKey);
    }

    const existingGroup = groupsMap[groupingKey];
    existingGroup.nodesMap[node.id] = {
      id: node.id,
      characters: node.characters,
    };
    existingGroup.count += 1;
  });
  const nodeGroups = Object.keys(groupsMap)
    .map((key) => groupsMap[key])
    .sort((a, b) => b.count - a.count);
  return nodeGroups;
};

const getStore = async (): Promise<PersistedStore> => {
  const defaultUrl = 'https://raw.githubusercontent.com/naftalibeder/figma-mock-content/main/index.json';

  try {
    const storeStr = await figma.clientStorage.getAsync("store");
    const store = JSON.parse(storeStr) as PersistedStore;
    console.log('Fetched store:', store);

    if (Object.keys(store).length === 0) {
      throw 'Persisted store is empty';
    }

    return {
      listUrls: store.listUrls,
      textBlocks: store.textBlocks,
    };
  } catch (e) {
    console.log('Error fetching store:', e);

    return {
      listUrls: { 'current': [defaultUrl] },
      textBlocks: {},
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
    writeToNodes(message)
  } else if (type === 'EXIT') {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshSelectedNodes();
});
