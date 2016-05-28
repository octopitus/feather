import getSignificantNodesForIndex from './getSignificantNodesForIndex';
import EditorDOMHandler from 'core/editor/dom';

const DOMUtil = EditorDOMHandler.DOMUtil;

export default function findNodeAndOffsetFromLocation(container, location) {
  const significantNodes = getSignificantNodesForIndex(container, location.index);
  let node, nodeOffset, offset = 0;

  for (let i = 0; i < significantNodes.length; i++) {
    const currentNode = significantNodes[i];
    const length = DOMUtil.nodeLength(currentNode);
    if (location.offset <= offset + length) {
      if (DOMUtil.nodeIsTextNode(currentNode)) {
        node = currentNode;
        nodeOffset = offset;
        if (location.offset === nodeOffset && DOMUtil.nodeIsCursorTarget(node)) {
          break;
        }
      } else if (!node) {
        node = currentNode;
        nodeOffset = offset;
      }
    }
    offset += length;
    if (offset > location.offset) {
      break;
    }
  }

  return [node, nodeOffset];
}
