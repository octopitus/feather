import SelectionManager from 'core/editor/selection'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function commandMoveUpNodesInSelection (editorState) {
  const nodesList = editorState.getNodesList()
  const { start, end } = editorState.getLocationRange()

  const nodeAtRangeStart = nodesList.get(start.index)
  const nodeBeforeRangeStart = nodesList.get(nodeAtRangeStart.before)

  // selection is collapsed (or not) at a node
  // just move that node
  if (start.index === end.index) {
    const newNodesList = nodesList.withMutations(state => {
      state.set(nodeAtRangeStart.id, {
        ...nodeAtRangeStart,
        content: nodeBeforeRangeStart.content,
        type: nodeBeforeRangeStart.type
      })

      state.set(nodeBeforeRangeStart.id, {
        ...nodeBeforeRangeStart,
        content: nodeAtRangeStart.content,
        type: nodeAtRangeStart.type
      })
    })

    return EditorState.update(editorState, {
      nodesList: newNodesList,
      locationRange: {
        index: nodeBeforeRangeStart.id,
        offset: start.offset
      }
    })
  }

  // @TODO: Handle moving up all nodes inside location range

  return editorState
}

export default commandMoveUpNodesInSelection
