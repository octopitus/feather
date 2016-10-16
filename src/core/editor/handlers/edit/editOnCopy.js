import SelectionManager from 'core/editor/selection'

function editOnCopy (event) {
  const editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  // No selection, so there's nothing to copy.
  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    event.preventDefault()
    return
  }
}

module.exports = editOnCopy
