import SelectionManager from 'core/editor/selection'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function commandMoveDownNodesInSelection (editorState) {
  const nodesList = editorState.getNodesList()
  const { start, end } = editorState.getLocationRange()

  const nodeAtRangeStart = nodesList.get(start.index)
  const nodeAfterRangeStart = nodesList.get(nodeAtRangeStart.after)

  // selection is collapsed (or not) at a node
  // just move that node
  if (start.index === end.index) {
    const newNodesList = nodesList.withMutations(state => {
      state.set(nodeAtRangeStart.id, {
        ...nodeAtRangeStart,
        content: nodeAfterRangeStart.content,
        type: nodeAfterRangeStart.type
      })

      state.set(nodeAfterRangeStart.id, {
        ...nodeAfterRangeStart,
        content: nodeAtRangeStart.content,
        type: nodeAtRangeStart.type
      })
    })

    return EditorState.update(editorState, {
      nodesList: newNodesList,
      locationRange: {
        index: nodeAfterRangeStart.id,
        offset: start.offset
      }
    })
  }

  // @TODO: Handle moving down all nodes inside location range

  return editorState
}

export default commandMoveDownNodesInSelection
