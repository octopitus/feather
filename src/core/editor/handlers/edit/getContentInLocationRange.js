import EditorState from 'core/editor/EditorState'
import store from 'core/store'

const push = Array.prototype.push
const Node = store.Node

function getContentInLocationRange (editorState) {
  const { start: rangeStart, end: rangeEnd } = editorState.getLocationRange()

  const nodeAtRangeStart = editorState.getNodeForKey(rangeStart.index)

  if (rangeStart.index === rangeEnd.index) {
    const { content } = Node.slice(rangeStart.offset, rangeEnd.offset, nodeAtRangeStart)
    return content
  }

  const nodeAtRangeEnd = editorState.getNodeForKey(rangeEnd.index)

  const { content: startContent } = Node.slice(rangeStart.offset, nodeAtRangeStart)
  const { content: endContent } = Node.slice(0, rangeEnd.offset, nodeAtRangeEnd)

  const contentInLocationRange = [].concat(startContent)

  let traversalNode = nodeAtRangeStart.after

  while (traversalNode !== nodeAtRangeEnd.id) {
    const { after, content } = editorState.getNodeForKey(traversalNode)
    push.apply(contentInLocationRange, content)
    traversalNode = after
  }

  push.apply(contentInLocationRange, endContent)

  return contentInLocationRange
}

module.exports = getContentInLocationRange
