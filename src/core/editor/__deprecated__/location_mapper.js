import * as domHelpers from './dom';

function nodeLength(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (domHelpers.nodeIsCursorTarget(node)) {
      return 0;
    }
    return node.textContent.length;
  } else if (domHelpers.tagName(node) === 'br' || domHelpers.nodeIsAttachmentElement(node)) {
    return 1;
  } else if (domHelpers.nodeIsContentBlock(node.previousSibling) && domHelpers.nodeIsContentBlock(node)) {
    return 1;
  }
  return 0;
}

function rejectEmptyTextNodes(node) {
  if (domHelpers.nodeIsEmptyTextNode(node)) {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_ACCEPT;
}

function rejectAttachmentContents(node) {
  if (domHelpers.nodeIsAttachmentElement(node.parentNode)) {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_ACCEPT;
}

function acceptSignificantNodes(node) {
  if (rejectEmptyTextNodes(node) === NodeFilter.FILTER_ACCEPT) {
    return rejectAttachmentContents(node);
  }
  return NodeFilter.FILTER_REJECT;
}

export default class LocationMapper {

  DOM = null;

  /**
   * @see in LocationManager#getLocationRange
   */
  findLocationFromContainerAndOffset(container, offset) {
    const relativeNode = domHelpers.findClosestElementFromNode(container, {
      matchingSelector: '[data-nodeid]'
    });

    if (relativeNode == null) return;

    let childIndex = 0;
    let foundBlock = false;

    let location = {
      index: relativeNode.getAttribute('data-nodeid'),
      offset: 0
    };

    const walker = domHelpers.walkTree(relativeNode, { usingFilter: rejectAttachmentContents });

    while (walker.nextNode()) {
      const node = walker.currentNode;

      if (node === container && domHelpers.nodeIsTextNode(container)) {
        if (!domHelpers.nodeIsCursorTarget(node)) location.offset += offset;
        break;
      } else {
        if (node.parentNode === container) {
          if (childIndex++ === offset) break;
        } else if (!domHelpers.elementContainsNode(container, node)) {
          if (childIndex > 0) break;
        }

        if (domHelpers.nodeIsBlockStartComment(node)) {
          if (foundBlock) location.index++;
          location.offset = 0;
          foundBlock = true;
        } else {
          location.offset += nodeLength(node);
        }
      }
    }

    return location;
  }

  /**
   * @see in LocationManager#setLocationRange
   */
  findContainerAndOffsetFromLocation({index, offset = 0} = {}) {
    if (index == null) return;

    let container = this.DOM.querySelector(`[data-nodeid="${index}"]`);

    if (container == null) return;

    if (offset === 0) {
      while (container.firstChild) {
        container = container.firstChild;
        if (domHelpers.nodeIsBlockContainer(container)) {
          offset = 1;
          break;
        }
      }

      return [container, offset];
    }

    let [node, nodeOffset] = this.findNodeAndOffsetFromLocation(location);
    if (!node) return;

    if (domHelpers.nodeIsTextNode(node)) {
      container = node;
      offset = location.offset - nodeOffset;
    } else {
      container = node.parentNode;
      if (!domHelpers.nodeIsBlockContainer(container)) {
        while (node === container.lastChild) {
          node = container;
          container = container.parentNode;
          if (domHelpers.nodeIsBlockContainer(container)) break;
        }
      }
      offset = domHelpers.findChildIndexOfNode(node);
      if (location.offset !== 0) offset++;
    }

    return [container, offset];
  }

  // @TODO:110 rewrite in ES6
  findNodeAndOffsetFromLocation(location) {
    let currentNode, i, len, length, node, nodeOffset, offset, ref;
    offset = 0;
    ref = this.getSignificantNodesForIndex(location.index);
    for (i = 0, len = ref.length; i < len; i++) {
      currentNode = ref[i];
      length = nodeLength(currentNode);
      if (location.offset <= offset + length) {
        if (domHelpers.nodeIsTextNode(currentNode)) {
          node = currentNode;
          nodeOffset = offset;
          if (location.offset === nodeOffset && domHelpers.nodeIsCursorTarget(node)) {
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

  getSignificantNodesForIndex(index) {
    const element = this.DOM.querySelector(`[data-nodeid="${index}"]`);
    const nodes = [];

    if (element == null) return nodes;

    const walker = domHelpers.walkTree(element, {
      usingFilter: acceptSignificantNodes
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      // @TODO:80 check for attachmentElement
      if (domHelpers.nodeIsContentBlock(node) || domHelpers.nodeIsTextNode(node)) {
        nodes.push(node);
      }
    }

    return nodes;
  }
}
