import invariant from 'invariant'

import SelectionManager from 'core/editor/selection'
import RichTextUtil from 'core/editor/utils/RichTextUtil'
import editor from 'core/editor'

const EditorState = editor.EditorState

import store from 'core/store'
const DataStore = store.DataStore
const NodeType = store.NodeType
const Node = store.Node

function commandConvertToType (type, editorState) {
  invariant(NodeType.has(type), `Type ${type} is not defined.`)

  const { index: startIndex } = editorState.getRangeStart()
  const nodesList = editorState.getNodesList()

  const newNodesList = nodesList.update(
    startIndex, node => ({ ...node, type })
  )

  return EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: startIndex
  })
}

export default commandConvertToType
