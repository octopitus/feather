import SelectionManager from 'core/editor/selection'
import RichTextUtil from 'core/editor/utils/RichTextUtil'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function commandRemoveBlock (stragery, editorState) {
  const nodesList = editorState.getNodesList()
  const { index: startIndex, offset: startOffset } = editorState.getRangeStart()

  const nodeAtCursorLocation = nodesList.get(startIndex)

  /**
   * @TODO: If the current node at currsor location is the last one,
   * we must find the next node of it in DataStore and link them together.
   */
  if (nodeAtCursorLocation === editorState.getLast()) {
    return editorState
  }

  if (stragery === 'backward') {
    const nodeBeforeCursorLocation = nodesList.get(
      nodeAtCursorLocation.before
    )

    let newNodesList = nodesList.withMutations(state => {
      state.set(nodeBeforeCursorLocation.id, {
        ...nodeBeforeCursorLocation,
        after: nodeAtCursorLocation.after,
        content: nodeBeforeCursorLocation.content.concat(nodeAtCursorLocation.content)
      })

      state.set(nodeAtCursorLocation.after, {
        ...state.get(nodeAtCursorLocation.after),
        before: nodeBeforeCursorLocation.id
      })
    })

    newNodesList = newNodesList.delete(nodeAtCursorLocation.id)

    return EditorState.update(editorState, {
      nodesList: newNodesList,
      locationRange: {
        index: nodeBeforeCursorLocation.id,
        // Set cursor to the length of previous state of node
        offset: RichTextUtil.getLength(nodeBeforeCursorLocation)
      }
    })
  }

  const nodeAfterCursorLocation = nodesList.get(
    nodeAtCursorLocation.after
  )

  let newNodesList = nodesList.withMutations(state => {
    state.set(nodeAtCursorLocation.id, {
      ...nodeAtCursorLocation,
      after: nodeAfterCursorLocation.after,
      content: nodeAtCursorLocation.content.concat(nodeAfterCursorLocation.content)
    })

    state.set(nodeAfterCursorLocation.after, {
      ...state.get(nodeAfterCursorLocation.after),
      before: nodeAtCursorLocation.id
    })
  })

  newNodesList = newNodesList.delete(nodeAfterCursorLocation.id)

  return EditorState.update(editorState, {
    nodesList: newNodesList
  })
}

export default commandRemoveBlock
