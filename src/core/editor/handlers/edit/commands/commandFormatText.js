import RichTextUtil from 'core/editor/utils/RichTextUtil'
import EditorState from 'core/editor/EditorState'

import store from 'core/store'

const Node = store.Node


function commandFormatText (format, editorState) {
  const {start, end} = editorState.getLocationRange()

  if (start.index === end.index) {
    const nodeAtCurrsorLocation = editorState.getNodeForKey(start.index)
    const { content: contentInLocationRange } = Node.slice(
      start.offset, end.offset, nodeAtCurrsorLocation
    )

    const commonAttrs = RichTextUtil.getCommonAttributes(contentInLocationRange)
    const willBeAppliedAttrs = {
      [format]: !commonAttrs || !commonAttrs[format] ? true : null
    }

    const formatOperator = RichTextUtil.build(delta => {
      return delta.retain(start.offset).retain(end.offset - start.offset, willBeAppliedAttrs)
    })

    const nodeAppliedOperator = (new Node(nodeAtCurrsorLocation)).compose(formatOperator)

    const newNodesList = editorState.getNodesList().set(
      start.index, nodeAppliedOperator.toObject()
    )

    return EditorState.update(editorState, {
      nodesList: newNodesList
    })
  }

  const contentsInLocationRange = editorState.extractContentsInLocationRange()
  const commonAttrs = RichTextUtil.getCommonAttributes(contentsInLocationRange)

  const willBeAppliedAttrs = {
    [format]: !commonAttrs || !commonAttrs[format] ? true : null
  }

  const newNodesList = editorState.getNodesList().withMutations(state => {
    // Apply format to node at start range
    const nodeAtStartRange = state.get(start.index)
    const startContentOperator = RichTextUtil.build(delta => {
      return delta.retain(start.offset)
        .retain(RichTextUtil.getLength(nodeAtStartRange) - start.offset, willBeAppliedAttrs)
    })

    state.set(
      start.index,
      (new Node(nodeAtStartRange)).compose(startContentOperator).toObject()
    )

    // Apply format to node at start range
    const nodeAtEndRange = state.get(end.index)
    const endContentOperator = RichTextUtil.build(delta => {
      return delta.retain(end.offset, willBeAppliedAttrs)
    })

    state.set(
      end.index,
      (new Node(nodeAtEndRange)).compose(endContentOperator).toObject()
    )

    // Apply to other nodes
    let nodeApplyingFormat = state.get(nodeAtStartRange.after)

    while (nodeApplyingFormat.id !== end.index) {
      const formatOperator = RichTextUtil.build(delta => // eslint-disable-line no-loop-func
        delta.retain(RichTextUtil.getLength(nodeApplyingFormat), willBeAppliedAttrs)
      )

      state.set(
        nodeApplyingFormat.id,
        (new Node(nodeApplyingFormat)).compose(formatOperator).toObject()
      )

      nodeApplyingFormat = state.get(nodeApplyingFormat.after)
    }
  })

  return EditorState.update(editorState, {
    nodesList: newNodesList
  })
}

export default commandFormatText
