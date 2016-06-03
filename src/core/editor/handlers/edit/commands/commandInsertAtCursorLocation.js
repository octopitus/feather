import SelectionManager from 'core/editor/selection'
import removeSelection from './commandRemoveSelection'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'

const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function commandInsertAtCursorLocation (nodeType = NodeType.defaultType, editorState) {
  const isCollapsed = SelectionManager.rangeIsCollapsed(
    editorState.getLocationRange()
  )

  if (!isCollapsed) {
    editorState = removeSelection(editorState)
  }

  const nodesList = editorState.getNodesList()
  const rangeStart = editorState.getRangeStart()

  let nodeAtRangeStart = nodesList.get(rangeStart.index)
  let nodeAfterRangeStart = new Node(nodesList.get(nodeAtRangeStart.after))

  const { content: newNodeContent } = Node.slice(rangeStart.offset, nodeAtRangeStart)

  nodeAtRangeStart = Node.slice(0, rangeStart.offset, nodeAtRangeStart)

  // If specified node has level equal to level of next
  // It means that node already has at least one child
  // Then add new node after it means add new child
  const level = (
    nodeAfterRangeStart &&
    nodeAfterRangeStart.level === nodeAtRangeStart.level + 1
  ) ? nodeAtRangeStart.level + 1 : nodeAtRangeStart.level

  const newNode = Node.create({
    before: nodeAtRangeStart.id,
    after: nodeAfterRangeStart.id,
    content: newNodeContent,
    type: nodeType,
    level: level
  })

  if (nodeAfterRangeStart == null) { /* eslint-disable-line eqeqeq */
    console.log('Insert at the end')
    return
  }

  nodeAtRangeStart = nodeAtRangeStart.set('after', newNode.id)
  nodeAfterRangeStart = nodeAfterRangeStart.set('before', newNode.id)

  const keySeq = nodesList.keySeq()
  const indexOfStart = keySeq.indexOf(rangeStart.index)

  const newNodesList = nodesList.entrySeq()
    .splice(
      indexOfStart,
      2,
      [nodeAtRangeStart.id, nodeAtRangeStart.toObject()],
      [newNode.id, newNode.toObject()],
      [nodeAfterRangeStart.id, nodeAfterRangeStart.toObject()]
    )

  return EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: newNode.id
  })
}

export default commandInsertAtCursorLocation
