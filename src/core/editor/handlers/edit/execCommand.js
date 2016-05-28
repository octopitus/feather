import commands from './commands'
import SelectionManager from 'core/editor/selection'

import editor from 'core/editor'
import store from 'core/store'

const EditorState = editor.EditorState
const DataStore = store.DataStore
const Node = store.Node

function execCommand (command, editorState) {
  switch (command) {
    case 'insert-break-line':
      return commands.insertBreakline(editorState)
    case 'insert-paragraph':
      return commands.insertParagraph(editorState)
    case 'insert-bullet':
      return commands.insertBullet(editorState)
    case 'move-left':
      return commands.decreaseIndentLevel(editorState)
    case 'move-right':
      return commands.increaseIndentLevel(editorState)
    case 'move-up':
      return commands.moveUpNodesInSelection(editorState)
    case 'move-down':
      return commands.moveDownNodesInSelection(editorState)
    case 'remove-selection':
      return commands.removeSelection(editorState)
    case 'backspace-character':
      return commands.removeCharBackward(editorState)
    case 'delete-character':
      return commands.removeCharForward(editorState)
    case 'backspace-word':
      return commands.removeWordBackward(editorState)
    case 'delete-word':
      return commands.removeWordForward(editorState)
    case 'backspace-content-block':
      return commands.removeBlockBackward(editorState)
    case 'delete-content-block':
      return commands.removeBlockForward(editorState)
    case 'zoom-in': {
      const isCollapsedAt = SelectionManager.rangeIsCollapsedAt(
        editorState.getLocationRange()
      )
      if (isCollapsedAt) {
        if (this.props.onNavigate) {
          this.props.onNavigate(isCollapsedAt)
        }

        setTimeout(() => {
          SelectionManager.setLocationRange(
            this.DOM, editorState.getLocationRange()
          )
        })

        break
      }
      return editorState
    }
    case 'zoom-out': {
      const header = editorState.getHeading()
      const parentKeyOfNode = DataStore.getParentKeyOfNode(header.id)

      if (parentKeyOfNode) {
        if (this.props.onNavigate) {
          this.props.onNavigate(parentKeyOfNode)
        }

        setTimeout(() => {
          SelectionManager.setLocationRange(
            this.DOM, editorState.getLocationRange()
          )
        })

        break
      }

      return editorState
    }
    case 'convert-to-paragraph':
      return commands.convertToParagraph(editorState)
    case 'convert-to-code-block': {
      editorState = commands.convertToCodeBlock(editorState)

      const isCollapsedAt = SelectionManager.rangeIsCollapsedAt(
        editorState.getLocationRange()
      )

      const nodesList = editorState.getNodesList()

      const newNodesList = nodesList.update(
        isCollapsedAt,
        node => Node.slice(2, node).toObject()
      )

      return EditorState.update(editorState, {
        nodesList: newNodesList,
        locationRange: editorState.getLocationRange()
      })
    }
    case 'format-bold':
    case 'format-italic':
    case 'format-underline':
      return commands.formatText(command.replace('format-', ''), editorState)
    case 'toggle-collapsed':
    case 'secondary-cut':
    case 'secondary-copy':
    case 'secondary-paste':
    case 'escape':
      return editorState
    default:
      return editorState
  }
}

export default execCommand
