import { WindowMessageConfirm, TextNodeGroup, WindowMessageUrl, WindowMessage, CodeMessageInit, CodeMessageGetNodes } from "./types";

figma.showUI(__html__, { width: 350, height: 570 });

const refreshEverything = async () => {
  const nodeGroups = getTextNodeGroups();
  const url = await getUrl();
  const message: CodeMessageInit = { type: 'INIT', nodeGroups, url };
  figma.ui.postMessage(message);
};

const refreshSelectedNodes = async () => {
  const nodeGroups = getTextNodeGroups();
  const message: CodeMessageGetNodes = { type: 'NODES', nodeGroups };
  figma.ui.postMessage(message);
};

const writeToNodes = (message: WindowMessageConfirm) => {
  const { itemsSequence, groupingKey } = message;

  const textNodes: TextNode[] = getTextNodesWithGroupingKey(groupingKey);

  textNodes.forEach(async (textNode, index) => {
    if (!textNode.hasMissingFont) {
      await figma.loadFontAsync(textNode.fontName as FontName);

      let text = "";
      itemsSequence.forEach(items => {
        const finalIndex = index % items.length;
        text += items[finalIndex];
      });
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

figma.ui.onmessage = (message: WindowMessage) => {
  const { type } = message;

  if (type === 'INIT') {
    refreshEverything();
  } else if (type === 'GET_NODES') {
    refreshSelectedNodes();
  } else if (type === 'URL') {
    saveUrl(message as WindowMessageUrl);
  } else if (type === 'CONFIRM') {
    writeToNodes(message as WindowMessageConfirm);
  } else if (type === 'CANCEL') {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  refreshSelectedNodes();
});