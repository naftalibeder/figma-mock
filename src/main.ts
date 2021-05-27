figma.showUI(__html__, { width: 300, height: 500 });

interface TextNodeInfo {
  id: string,
  characters: string,
}

class TextNodeGroup {
  key: string;
  nodesMap: {[id: string]: TextNodeInfo};
  count: number;

  constructor(key: string) {
    this.key = key;
    this.nodesMap = {};
    this.count = 0;
  }
}

const onStart = async () => {
  const nodeGroups = getTextNodeGroups();
  const url = await getUrl();
  figma.ui.postMessage({ type: 'init', nodeGroups, url });
};

const onPressConfirm = (items: string[], groupingKey: string, randomize: boolean, capitalize: boolean) => {
  const textNodes: TextNode[] = getTextNodesWithGroupingKey(groupingKey);

  textNodes.forEach(async (textNode, index) => {
    if (!textNode.hasMissingFont) {
      await figma.loadFontAsync(textNode.fontName as FontName);
      let finalIndex = index % items.length;
      if (randomize) finalIndex = Math.floor(Math.random() * items.length);
      let text = items[finalIndex];
      if (capitalize) text = text.slice(0, 1).toUpperCase() + text.slice(1);
      textNode.characters = text;
    } else {
      console.log('Text node is missing a font and cannot be edited.')
    }
  });
};

const appendChildTextNodes = (nodes: TextNode[], node: BaseNode) => {
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE') {
    node.children.forEach((node) => appendChildTextNodes(nodes, node));
  } else if (node.type === 'TEXT') {
    nodes.push(node);
  }
}

const getAllTextNodes = (selectedNodes: readonly SceneNode[]): TextNode[] => {
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
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;
  const nodes = getAllTextNodes(selectedNodes);

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

const setUrl = async (url: string) => {
  await figma.clientStorage.setAsync('url', url);
}

figma.ui.onmessage = msg => {
  if (msg.type === 'init') {
    onStart();
  } else if (msg.type === 'url') {
    setUrl(msg.url);
  } else if (msg.type === 'confirm') {
    onPressConfirm(msg.items, msg.groupingKey, msg.randomize, msg.capitalize);
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

figma.on("selectionchange", () => {
  if (figma.currentPage.selection.length > 0) {
    onStart();
  } else {
    figma.ui.postMessage({ type: 'clear' });
  }
});