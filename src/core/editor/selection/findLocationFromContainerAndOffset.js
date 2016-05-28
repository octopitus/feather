import EditorDOMHandler from 'core/editor/dom'

const DOMUtil = EditorDOMHandler.DOMUtil
const NodeFilter = EditorDOMHandler.NodeFilter

export default function findLocationFromContainerAndOffset (container, offset) {
  const relativeNode = DOMUtil.findClosestElementFromNode(container, {
    matchingSelector: '[data-nodeid]'
  })

  if (relativeNode == null) { // eslint-disable-line eqeqeq
    return
  }

  let childIndex = 0
  let foundBlock = false

  let location = {
    index: relativeNode.getAttribute('data-nodeid'),
    offset: 0
  }

  const walker = DOMUtil.walkTree(relativeNode, { usingFilter: NodeFilter.rejectAttachmentContents })

  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node === container) {
      if (
        DOMUtil.nodeIsTextNode(node) &&
        !DOMUtil.nodeIsCursorTarget(node)
      ) {
        location.offset += offset
      }
      if (DOMUtil.nodeIsContentBlock(node)) {
        location.offset += DOMUtil.nodeLength(node)
      }
      break
    } else {
      if (node.parentNode === container) {
        if (childIndex++ === offset) break
      } else if (!DOMUtil.elementContainsNode(container, node)) {
        if (childIndex > 0) break
      }
      location.offset += DOMUtil.nodeLength(node)
    }
  }

  return location
}
