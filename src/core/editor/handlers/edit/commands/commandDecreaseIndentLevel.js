import editor from 'core/editor'

const EditorState = editor.EditorState

function commandDecreaseIndentLevel (editorState) {
  const nodesList = editorState.getNodesList()
  const { start, end } = editorState.getLocationRange()

  let currentNode = nodesList.get(start.index)
  let header = editorState.getHeading()

  if (currentNode === header) {
    return editorState
  }

  const newNodesList = nodesList.withMutations(state => {
    while (currentNode.before !== end.index) {
      if (currentNode.level > header.level + 1) {
        state.set(currentNode.id, {
          ...currentNode,
          level: currentNode.level - 1 || 1
        })
      }
      currentNode = state.get(currentNode.after)
    }
  })

  return EditorState.update(editorState, {
    nodesList: newNodesList
  })
}

export default commandDecreaseIndentLevel
