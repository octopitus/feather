import EditorDOMHandler from 'core/editor/dom';

const DOMUtil = EditorDOMHandler.DOMUtil;
const NodeFilter = EditorDOMHandler.NodeFilter;

export default function getSignificantNodesForIndex(element, index) {
  // const element = container.querySelector(`[data-nodeid="${index}"]`);
  if (element == null) { // eslint-disable-line eqeqeq
    return [];
  }

  const nodes = [];

  const walker = DOMUtil.walkTree(element, {
    usingFilter: NodeFilter.acceptSignificantNodes
  });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    // @TODO:80 check for attachmentElement
    if (DOMUtil.nodeIsContentBlock(node) || DOMUtil.nodeIsTextNode(node)) {
      nodes.push(node);
    }
  }

  return nodes;
}
