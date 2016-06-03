import parseHTMLData from 'core/editor/dom/NodeContentParser'
import RichTextUtil from 'core/editor/utils/RichTextUtil'
import SelectionManager from 'core/editor/selection'
import removeSelection from './commands/commandRemoveSelection'
import EditorState from 'core/editor/EditorState'
import store from 'core/store'

const Node = store.Node

const concat = (...args) => {
  return Array.prototype.concat.apply([], args)
}

function editOnPaste (event) {
  event.preventDefault()

  let editorState = this.state.editorState
  const locationRange = editorState.getLocationRange()

  if (SelectionManager.rangeIsCollapsed(locationRange)) {
    editorState = removeSelection(editorState)
  }

  const nodesList = editorState.getNodesList()
  const { start: collapsedAt } = locationRange
  const currentNode = nodesList.get(collapsedAt.index)

  const externalClipboard = event.clipboardData

  if (!externalClipboard) {
    return
  }

  const clipboardData = (
    externalClipboard.types.indexOf('text/html') !== -1 ?
    externalClipboard.getData('text/html') :
    externalClipboard.getData('text/plain')
  )

  const deltaFromClipboard = RichTextUtil.create(
    parseHTMLData(clipboardData)
  )

  const {content: startContent} = Node.slice(0, collapsedAt.offset, currentNode)
  const {content: endContent} = Node.slice(collapsedAt.offset, currentNode)

  const newContent = concat(startContent, deltaFromClipboard.ops, endContent)
  const newLength = collapsedAt.offset + deltaFromClipboard.length()

  const newNodesList = nodesList.set(currentNode.id, {
      ...currentNode,
      content: newContent
    }
  )

  const newState = EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: {
      index: collapsedAt.index,
      offset: newLength
    }
  })

  this.setState({ editorState: newState }, () => {
    SelectionManager.setLocationRange(
      this.DOM,
      newState.getLocationRange()
    )
  });

  return
  //
}

module.exports = editOnPaste
