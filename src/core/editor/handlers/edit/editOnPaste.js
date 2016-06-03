import RichTextUtil from 'core/editor/utils/RichTextUtil'
import SelectionManager from 'core/editor/selection'
import removeSelection from './commands/commandRemoveSelection'
import EditorState from 'core/editor/EditorState'
import store from 'core/store'

const Node = store.Node

function editOnPaste (event) {
  event.preventDefault()

  let editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    editorState = removeSelection(editorState)
  }

  const nodesList = editorState.getNodesList()
  const { start: collapsedAt } = locationRange

  const internalClipboardData = this.getClipboard()

  if (internalClipboardData) {
    if (!internalClipboardData.nodesInLocationRange) {
      const { startContent } = internalClipboardData

      console.log(startContent);

      const operator = RichTextUtil.build(delta => {
        return delta.retain(collapsedAt.offset).concat(startContent)
      });

      const currentNode = nodesList.get(collapsedAt.index)
      const node = (new Node(currentNode)).compose(operator)

      console.log(node.toObject());
    }
    return
  }

  const externalClipboard = event.clipboardData

  if (externalClipboard) {
    const clipboardData = externalClipboard.getData('text/plain')

    const operator = RichTextUtil.build(delta => {
      return delta.retain(collapsedAt.offset).insert(clipboardData)
    });

    const currentNode = nodesList.get(collapsedAt.index)
    const node = (new Node(currentNode)).compose(operator)

    const newNodesList = nodesList.set(collapsedAt.index, node.toObject())

    const newState = EditorState.update(editorState, {
      nodesList: newNodesList,
      locationRange: {
        index: collapsedAt.index,
        offset: collapsedAt.offset + clipboardData.length
      }
    })

    this.setState({ editorState: newState }, () => {
      SelectionManager.setLocationRange(
        this.DOM,
        newState.getLocationRange()
      )
    });

    return
  }

  //
}

module.exports = editOnPaste
