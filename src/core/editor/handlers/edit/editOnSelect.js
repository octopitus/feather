import editor from 'core/editor'
import dom from 'core/editor/dom'
import SelectionManager from 'core/editor/selection'

const EditorState = editor.EditorState
const DOMUtil = dom.DOMUtil

function editOnSelect (e) {
  if (this._blockSelectEvent || !DOMUtil.innerElementIsActive(this.DOM)) {
    return
  }

  const editorState = this.state.editorState

  const currentLocationRange = editorState.getLocationRange()
  const updatedLocationRange = SelectionManager.createLocationRange()

  // Update "fingerprint" in editor
  if (
    SelectionManager.isValidRange(updatedLocationRange) &&
    !SelectionManager.rangesAreEqual(currentLocationRange, updatedLocationRange)
  ) {
    if (this.props.onLocationChange) {
      this.props.onLocationChange(updatedLocationRange)
    }

    const newState = EditorState.update(editorState, {
      locationRange: updatedLocationRange
    })

    this.setState({ editorState: newState })
  }
}

export default editOnSelect
