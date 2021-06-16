import { Casing } from "./enums";
import { WindowMessageConfirm, TextNodeGroup, WindowMessageUrl, WindowMessageInit } from "./types";

figma.showUI(__html__, { width: 320, height: 570 });

const refreshEverything = async () => {
  const nodeGroups = getTextNodeGroups();
  const url = await getUrl();
  figma.ui.postMessage({ type: 'init', nodeGroups, url });
};

const refreshSelectedNodes = async () => {
  const nodeGroups = getTextNodeGroups();
  figma.ui.postMessage({ type: 'nodes', nodeGroups });
};

const writeToNodes = (message: WindowMessageConfirm) => {
  const { items, groupingKey, casing, prepend, append } = message;

  const textNodes: TextNode[] = getTextNodesWithGroupingKey(groupingKey);

  textNodes.forEach(async (textNode, index) => {
    if (!textNode.hasMissingFont) {
      await figma.loadFontAsync(textNode.fontName as FontName);

      const finalIndex = index % items.length;
      let text = items[finalIndex];

      if (casing === Casing.Sentence) text = sentenceCase(text);
      if (casing === Casing.Title) text = titleCase(text);
      if (casing === Casing.Upper) text = text.toUpperCase();
      if (casing === Casing.Lower) text = text.toLowerCase();

      if (prepend) text = prepend + text;
      if (append) text = text + append;

      textNode.characters = text;
    } else {
      console.log('Text node is missing a font and cannot be edited.')
    }

    if (index === textNodes.length - 1) {
      refreshSelectedNodes();
    }
  });
};

const appendChildTextNodes = (nodes: TextNode[], node: BaseNode) => {
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    node.children.forEach((node) => appendChildTextNodes(nodes, node));
  } else if (node.type === 'TEXT') {
    nodes.push(node);
  }
}

const getAllSelectedTextNodes = (): TextNode[] => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;
  let all: TextNode[] = [];
  selectedNodes.forEach((node) => appendChildTextNodes(all, node));
  return all;
};

const getTextNodesWithGroupingKey = (key: string): TextNode[] => {
  const nodeGroups = getTextNodeGroups();
  const nodeGroup = nodeGroups.filter(group => group.key == key)[0];
  const nodesInfos = Object.values(nodeGroup.nodesMap);
  const nodes = nodesInfos.map(o => figma.getNodeById(o.id) as TextNode);
  return nodes;
}

const getTextNodeGroups = (): TextNodeGroup[] => {
  const nodes = getAllSelectedTextNodes();

  let groupsMap: {[key: string]: TextNodeGroup} = {};
  nodes.forEach(node => {
    const groupingKey = `${node.x},${node.y}`;

    if (!groupsMap[groupingKey]) {
      groupsMap[groupingKey] = new TextNodeGroup(groupingKey);
    }

    const existingGroup = groupsMap[groupingKey];
    existingGroup.nodesMap[node.id] = { id: node.id, characters: node.characters };
    existingGroup.count += 1;
  });
  const nodeGroups = Object.keys(groupsMap)
  .map(key => groupsMap[key])
  .sort((a, b) => b.count - a.count);
  return nodeGroups;
}

const getUrl = async (): Promise<string> => {
  return figma.clientStorage.getAsync('url');
}

const saveUrl = async (message: WindowMessageUrl) => {
  await figma.clientStorage.setAsync('url', message.url);
}

figma.ui.onmessage = (message: WindowMessageInit | WindowMessageConfirm | WindowMessageUrl) => {
  if (message.type === 'init') {
    refreshEverything();
  } else if (message.type === 'get-nodes') {
    refreshSelectedNodes();
  } else if (message.type === 'save-url') {
    saveUrl(message as WindowMessageUrl);
  } else if (message.type === 'confirm') {
    writeToNodes(message as WindowMessageConfirm);
  } else if (message.type === 'cancel') {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshSelectedNodes();
});

const sentenceCase = (text: string) => {
  return text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
}

const titleCase = (text: string) => {
  return text.split(' ').map(word => sentenceCase(word)).join(' ');
}