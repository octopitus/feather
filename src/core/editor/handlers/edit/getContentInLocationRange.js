import EditorState from 'core/editor/EditorState'
import store from 'core/store'

const push = Array.prototype.push
const Node = store.Node

function getContentInLocationRange (editorState) {
  const { start: rangeStart, end: rangeEnd } = editorState.getLocationRange()

  const nodeAtRangeStart = editorState.getNodeForKey(rangeStart.index)

  if (rangeStart.index === rangeEnd.index) {
    const { content: startContent } = Node.slice(
      rangeStart.offset, rangeEnd.offset, nodeAtRangeStart
    )

    return { startContent }
  }

  const nodeAtRangeEnd = editorState.getNodeForKey(rangeEnd.index)

  const { content: startContent } = Node.slice(rangeStart.offset, nodeAtRangeStart)
  const { content: endContent } = Node.slice(0, rangeEnd.offset, nodeAtRangeEnd)

  const nodesInLocationRange = []

  let traversalNode = nodeAtRangeStart.after

  while (traversalNode !== nodeAtRangeEnd.id) {
    const node = editorState.getNodeForKey(traversalNode)
    push.apply(nodesInLocationRange, node)
    traversalNode = node.after
  }

  return {
    startContent,
    nodesInLocationRange,
    endContent
  }
}

module.exports = getContentInLocationRange
