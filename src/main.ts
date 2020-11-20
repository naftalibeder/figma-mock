figma.showUI(__html__, { width: 240, height: 400 });

const onStart = () => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;

  const nodes = getAllTextNodes(selectedNodes);
  const uniqueNodes = getUniqueTextNodes(nodes);

  figma.ui.postMessage({ type: 'init', uniqueNodes });
};

const onPressConfirm = (listText: string, selectionText: string) => {
  const selectedNodes: readonly SceneNode[] = figma.currentPage.selection;

  const listLines: string[] = listText.split('\n').filter(line => line.length > 0);
  const textNodes: TextNode[] = getTextNodesContainingText(selectedNodes, selectionText);

  textNodes.forEach(async (textNode, index) => {
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.characters = listLines[index % listLines.length];
  });
};

const appendChildTextNodes = (nodes: TextNode[], node: BaseNode) => {
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'INSTANCE') {
    const childNodes: TextNode[] = node.children.filter(child => child.type === 'TEXT') as TextNode[];
    Array.prototype.push.apply(nodes, childNodes);
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

const getUniqueTextNodes = (nodes: TextNode[]) => {
  const components = nodes.map((node: TextNode) => node.name);
  return Array.from(new Set(components));
}

const getTextNodesContainingText = (selectedNodes: readonly SceneNode[], text: string) => {
  const all: TextNode[] = getAllTextNodes(selectedNodes);
  return all.filter(node => node.characters == text);
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