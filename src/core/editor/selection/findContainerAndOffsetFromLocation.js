import findNodeAndOffsetFromLocation from './findNodeAndOffsetFromLocation'
import EditorDOMHandler from 'core/editor/dom'

const DOMUtil = EditorDOMHandler.DOMUtil

export default function findContainerAndOffsetFromLocation (container, {index, offset = 0} = {}) {
  if (index == null) { // eslint-disable-line eqeqeq
    return
  }

  container = container.querySelector(`[data-nodeid="${index}"]`)

  if (container == null) { // eslint-disable-line eqeqeq
    return
  }

  if (offset === 0) {
    while (container.firstChild) {
      container = container.firstChild
      if (DOMUtil.nodeIsBlockContainer(container)) {
        offset = 1
        break
      }
    }

    return [container, offset]
  }

  let [node, nodeOffset] = findNodeAndOffsetFromLocation(container, {index, offset})

  if (node == null) { // eslint-disable-line eqeqeq
    return
  }

  if (DOMUtil.nodeIsTextNode(node)) {
    container = node
    offset = offset - nodeOffset
  } else {
    container = node
    offset = 0
  }

  return [container, offset]
}
