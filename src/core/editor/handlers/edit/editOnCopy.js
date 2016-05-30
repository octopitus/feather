import SelectionManager from 'core/editor/selection'
import getContentInLocationRange from './getContentInLocationRange'

/**
 * If we have a selection, create a ContentState fragment and store
 * it in our internal clipboard. Subsequent paste events will use this
 * fragment if no external clipboard data is supplied.
 */
function editOnCopy (event) {
  const editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  // No selection, so there's nothing to copy.
  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    e.preventDefault()
    return
  }

  const clipboardData = getContentInLocationRange(editorState)

  this.setClipboard(clipboardData)
}

module.exports = editOnCopy
