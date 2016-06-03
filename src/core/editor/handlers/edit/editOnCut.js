import SelectionManager from 'core/editor/selection'

import removeSelection from './commands/commandRemoveSelection'
import getContentInLocationRange from './getContentInLocationRange'

// const getScrollPosition = require('getScrollPosition')

/**
 * On `cut` events, native behavior is allowed to occur so that the system
 * clipboard is set properly. This means that we need to take steps to recover
 * the editor DOM state after the `cut` has occurred in order to maintain
 * control of the component.
 *
 * In addition, we can keep a copy of the removed fragment, including all
 * styles and entities, for use as an internal paste.
 */
function editOnCut (event) {
  const editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  // No selection, so there's nothing to cut.
  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    e.preventDefault()
    return
  }

  const clipboardData = getContentInLocationRange(editorState)
  this.setClipboard(clipboardData)

  // Set `cut` mode to disable all event handling temporarily.
  this.setRenderGuard()
  this.setMode('cut')

  // Let native `cut` behavior occur, then recover control.
  setTimeout(() => {
    this.restoreEditorDOM()
    this.removeRenderGuard()
    this.setMode('edit')
    const newState = removeSelection(editorState)
    this.setState({ editorState: newState }, () => {
      SelectionManager.setLocationRange(
        this.DOM, newState.getLocationRange()
      )
    })
  }, 0)
}

module.exports = editOnCut
