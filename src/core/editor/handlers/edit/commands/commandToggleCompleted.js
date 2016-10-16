import SelectionManager from 'core/editor/selection'
import editor from 'core/editor'
import store from 'core/store'

const EditorState = editor.EditorState
const NodeType = store.NodeType

function commandToggleCompleted (editorState, nodeId) {
  const rangeIsCollapsed = SelectionManager.rangeIsCollapsed(
    editorState.getLocationRange()
  )

  if (!rangeIsCollapsed) {
    return editorState
  }

  const { index: startIndex } = editorState.getRangeStart()
  nodeId = nodeId || startIndex

  const { type: nodeType } = editorState.getNodeForKey(nodeId)

  if (nodeType !== NodeType.checkbox) {
    return editorState
  }

  const newNodeslist = editorState.getNodesList().update(nodeId, (node) => ({
    ...node,
    completed: !node.completed
  }))

  return EditorState.update(editorState, {
    nodesList: newNodeslist
  })
}

export default commandToggleCompleted
