import removeSelection from './commands/commandRemoveSelection'
import SelectionManager from 'core/editor/selection'
import RichTextUtil from 'core/editor/utils/RichTextUtil'

import editor from 'core/editor'
import store from 'core/store'

const EditorState = editor.EditorState
const NodeEntity = store.Node

function editOnBeforeInput (event) {
  const chars = event.data

  // In some cases (ex: IE ideographic space insertion) no character data
  // is provided. There's nothing to do when this happens.
  if (!chars) {
    return
  }

  event.preventDefault()

  let editorState = this.state.editorState

  const isCollapsed = SelectionManager.rangeIsCollapsed(
    editorState.getLocationRange()
  )

  if (!isCollapsed) {
    editorState = removeSelection(editorState)
  }

  const { offset: startOffset, index: startIndex } = editorState.getRangeStart()
  const nodesList = editorState.getNodesList()

  const newNodesList = nodesList.withMutations(state => {
    const nodeAtCursorPosition = new NodeEntity(state.get(startIndex))
    const insertOperator = RichTextUtil.build(delta => {
      return delta.retain(startOffset).insert(chars)
    })
    const nodeAppliedOperator = nodeAtCursorPosition.compose(insertOperator)
    state.set(startIndex, nodeAppliedOperator.toObject())
  })

  const newState = EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: {
      index: startIndex,
      offset: startOffset + 1
    }
  })

  if (this.props.onUpdate) {
    this.props.onUpdate(newState)
  }

  this.setState({ editorState: newState }, () => {
    SelectionManager.setLocationRange(
      this.DOM, newState.getLocationRange()
    )
  })
}

export default editOnBeforeInput
