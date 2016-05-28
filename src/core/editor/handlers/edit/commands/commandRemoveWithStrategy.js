import SelectionManager from 'core/editor/selection'
import RichTextUtil from 'core/editor/utils/RichTextUtil'
import getRemovableWord from 'core/editor/utils/getRemovableWord'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function getRemovableLength (backward) {
  const DOMRange = SelectionManager.getNativeDOMRange()
  const textContent = DOMRange.startContainer.textContent
  const removableOffset = DOMRange.startOffset

  const removableWord = getRemovableWord(
    String.prototype.slice.apply(
      textContent,
      backward ? [0, removableOffset] : [removableOffset]
    ),
    backward
  )

  return removableWord.length || 1
}

function commandRemoveWord (removeLength, isBackspace, editorState) {
  removeLength = removeLength || getRemovableLength(isBackspace)

  const nodesList = editorState.getNodesList()
  const rangeStart = editorState.getRangeStart()

  const retainLength = isBackspace ? rangeStart.offset - removeLength : rangeStart.offset
  const removeWordOperator = RichTextUtil.build(delta =>
    delta.retain(retainLength).delete(removeLength)
  )

  const nodeAtCursorLocation = new Node(nodesList.get(rangeStart.index))
  const nodeAppliedOperator = nodeAtCursorLocation.compose(removeWordOperator)

  const newNodesList = nodesList.update(
    nodeAtCursorLocation.id,
    node => ({
      ...node,
      content: nodeAppliedOperator.get('content')
    })
  )

  return EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: {
      index: rangeStart.index,
      offset: retainLength
    }
  })
}

export default commandRemoveWord
