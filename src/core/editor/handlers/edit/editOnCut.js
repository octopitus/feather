import SelectionManager from 'core/editor/selection'
import removeSelection from './commands/commandRemoveSelection'
// import getContentInLocationRange from './getContentInLocationRange'

function editOnCut (event) {
  const editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  // No selection, so there's nothing to cut.
  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    event.preventDefault()
    return
  }

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
