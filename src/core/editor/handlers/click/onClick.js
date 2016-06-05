import styles from 'components/Document/Node.css'

import SelectionManager from 'core/editor/selection'

import store from 'core/store'
import editor from 'core/editor'

const EditorState = editor.EditorState
const Node = store.Node

function onClick(event) {
  const isClickOnCheckbox = event.target.classList.contains(styles.checkbox)

  if (!isClickOnCheckbox) {
    return
  }

  event.preventDefault()

  const nodeId = event.target.getAttribute('data-nodeid')
  const editorState = this.state.editorState

  const newNodeslist = editorState.getNodesList().update(nodeId, (node) => ({
      ...node,
      completed: !node.completed
    })
  )

  const newState = EditorState.update(editorState, {
    nodesList: newNodeslist
  })

  this.setState({ editorState: newState }, () => {
    SelectionManager.setLocationRange(
      this.DOM,
      newState.getLocationRange()
    )
  })
}

export default onClick;
