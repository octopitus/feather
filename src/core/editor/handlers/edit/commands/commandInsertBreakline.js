import SelectionManager from 'core/editor/selection'
import commandRemoveSelection from './commandRemoveSelection'

import RichTextUtil from 'core/editor/utils/RichTextUtil'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const Node = store.Node

function commandInsertBreakline (editorState) {
  const isCollapsed = SelectionManager.rangeIsCollapsed(
    editorState.getLocationRange()
  )

  if (!isCollapsed) {
    editorState = commandRemoveSelection(editorState)
  }

  const nodesList = editorState.getNodesList()
  const rangeStart = editorState.getRangeStart()

  const nodeAtRangeStart = nodesList.get(rangeStart.index)

  const operators = RichTextUtil.build((delta) =>
    delta.retain(rangeStart.offset).insert('\n')
  )

  const nodeAppliedOperators = new Node(nodeAtRangeStart).compose(operators)

  const newNodesList = nodesList.set(
    rangeStart.index, nodeAppliedOperators.toObject()
  )

  return EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: {
      index: rangeStart.index,
      offset: rangeStart.offset + 1
    }
  })
}

export default commandInsertBreakline
