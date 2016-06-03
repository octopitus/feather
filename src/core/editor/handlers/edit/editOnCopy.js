import SelectionManager from 'core/editor/selection'
import getContentInLocationRange from './getContentInLocationRange'

function editOnCopy (event) {
  const editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  // No selection, so there's nothing to copy.
  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    e.preventDefault()
    return
  }
}

module.exports = editOnCopy
