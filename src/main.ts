figma.showUI(__html__, { width: 240, height: 400 });

class TextNodeKind {
  nodeName: string;
  nodeIds: {[id: string]: boolean};
  count: number;

  constructor(nodeName: string) {
    this.nodeName = nodeName;
    this.nodeIds = {};
    this.count = 0;
  }
}

const onStart = () => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;

  const nodes = getAllTextNodes(selectedNodes);

  let kindsMap: {[id: string]: TextNodeKind} = {};
  nodes.forEach(node => {
    if (!kindsMap[node.name]) {
      kindsMap[node.name] = new TextNodeKind(node.name);
    }

    const existingKind = kindsMap[node.name];
    existingKind.nodeIds[node.id] = true;
    existingKind.count += 1;
  });
  const uniqueKinds = Object.keys(kindsMap)
  .map(nodeName => kindsMap[nodeName])
  .sort((a, b) => b.count - a.count);

  figma.ui.postMessage({ type: 'init', uniqueKinds });
};

const onPressConfirm = (listText: string, selectionText: string) => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;

  const listLines: string[] = listText.split('\n').filter(line => line.length > 0);
  const textNodes: TextNode[] = getTextNodesWithName(selectedNodes, selectionText);

  textNodes.forEach(async (textNode, index) => {
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.characters = listLines[index % listLines.length];
  });
};

const appendChildTextNodes = (nodes: TextNode[], node: BaseNode) => {
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE') {
    node.children.forEach((node) => appendChildTextNodes(nodes, node));
  } else if (node.type === 'TEXT') {
    nodes.push(node);
  }
}

const getAllTextNodes = (selectedNodes: readonly SceneNode[]) => {
  let all: TextNode[] = [];
  selectedNodes.forEach((node) => appendChildTextNodes(all, node));
  return all;
};

const getTextNodesWithName = (selectedNodes: readonly SceneNode[], text: string) => {
  const all: TextNode[] = getAllTextNodes(selectedNodes);
  return all.filter(node => node.name == text);
}

figma.ui.onmessage = msg => {
  if (msg.type === 'init') {
    onStart();
  } else if (msg.type === 'confirm') {
    onPressConfirm(msg.listText, msg.selectionText);
    figma.closePlugin();
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};