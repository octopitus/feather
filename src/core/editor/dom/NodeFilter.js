import DOMUtil from './DOMUtil'
const OriginalNodeFilter = global.NodeFilter

class NodeFilter {
  static rejectEmptyTextNodes (node) {
    if (DOMUtil.nodeIsEmptyTextNode(node)) {
      return OriginalNodeFilter.FILTER_REJECT
    }
    return OriginalNodeFilter.FILTER_ACCEPT
  }

  static rejectAttachmentContents (node) {
    if (DOMUtil.nodeIsAttachmentElement(node.parentNode)) {
      return OriginalNodeFilter.FILTER_REJECT
    }
    return OriginalNodeFilter.FILTER_ACCEPT
  }

  static acceptSignificantNodes (node) {
    if (NodeFilter.rejectEmptyTextNodes(node) === OriginalNodeFilter.FILTER_ACCEPT) {
      return NodeFilter.rejectAttachmentContents(node)
    }
    return OriginalNodeFilter.FILTER_REJECT
  }
}

export default NodeFilter
