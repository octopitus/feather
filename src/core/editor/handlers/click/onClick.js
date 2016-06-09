import SelectionManager from 'core/editor/selection'
import styles from 'components/Document/Node.css'
import { markAsCommpleted } from '../edit/commands'

function onClick(event) {
  const classList = event.target.classList
  const isClickOnCheckbox = classList.contains(styles.checkbox)

  if (!isClickOnCheckbox) {
    return
  }

  event.preventDefault()

  const editorState = this.state.editorState
  const nodeId = event.target.getAttribute('data-nodeid')

  const newState = markAsCommpleted(editorState, nodeId);

  if (newState !== editorState) {
    this.setState({ editorState: newState }, () => {
      SelectionManager.setLocationRange(
        this.DOM,
        newState.getLocationRange()
      )
    })
  }
}

export default onClick;
