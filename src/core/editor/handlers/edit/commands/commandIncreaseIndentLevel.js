import editor from 'core/editor'

const EditorState = editor.EditorState

function commandIncreaseIndentLevel (editorState) {
  const nodesList = editorState.getNodesList()
  const { start, end } = editorState.getLocationRange()

  let currentNode = nodesList.get(start.index)

  if (currentNode === editorState.getHeading()) {
    return editorState
  }

  const nodeBeforeRangeStart = nodesList.get(currentNode.before)

  if (currentNode.level >= nodeBeforeRangeStart.level + 1) {
    return editorState
  }

  const newNodesList = nodesList.withMutations(state => {
    while (currentNode.before !== end.index) {
      state.set(currentNode.id, {
        ...currentNode,
        level: currentNode.level + 1
      })

      currentNode = state.get(currentNode.after)
    }
  })

  return EditorState.update(editorState, {
    nodesList: newNodesList
  })
}

export default commandIncreaseIndentLevel
