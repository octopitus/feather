import getKeyCommand from './getKeyCommand'
import execCommand from './execCommand'
import commandRemoveWord from './commands/commandRemoveWord'

import SelectionManager from 'core/editor/selection'

/**
 * Intercept keyup behavior to handle keys and commands manually, if desired.
 */
function editOnKeyDown (event) {
  const editorState = this.state.editorState

  const command = getKeyCommand(event, editorState)

  // If no command is specified, allow keyup event to continue.
  if (!command) {
    return
  }

  console.info('Exec command', command)

  event.preventDefault()

  const newState = execCommand.call(this, command, editorState)

  if (newState && newState !== editorState) {
    if (this.props.onUpdate) {
      this.props.onUpdate(newState)
    }

    this.setState({ editorState: newState }, function () {
      SelectionManager.setLocationRange(
        this.DOM, newState.getLocationRange()
      )
    })
  }
}

export default editOnKeyDown
