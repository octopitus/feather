import Keys from './keyContants'
import NodeType from 'core/store/NodeType'
import RichTextUtil from 'core/editor/utils/RichTextUtil'

import SelectionManager from 'core/editor/selection'
import editor from 'core/editor'

const EditorState = editor.EditorState
const EditorStateModifier = editor.EditorStateModifier

function getKeyCommand (event, editorState) {
  const keyCode = event.which

  switch (keyCode) {
    case Keys.ENTER: {
      // press shift + enter always insert new paragraph
      // after current focusing one
      if (event.shiftKey) {
        return 'insert-paragraph'
      }

      // Manually insert break-line
      const { index: startIndex } = editorState.getRangeStart()
      const nodeAtRangeStart = editorState.getNodeForKey(startIndex)

      const isBlockContentType = NodeType.blockContentTypes.indexOf(
        nodeAtRangeStart.type
      )

      if (isBlockContentType !== -1) {
        return 'insert-break-line'
      }

      return 'insert-bullet'
    }
    case Keys.SPACE: {
      if (event.ctrlKey) {
        // Toggle collapsed status of specfied node if range is also collapsed
        // and that node is has-children type
        const isCollapsedAt = SelectionManager.rangeIsCollapsedAt(
          editorState.getLocationRange()
        )

        const nodeAtRangeStart = editorState.getNodeForKey(isCollapsedAt)
        const hasChildrenType = NodeType.hasChildrenTypes.indexOf(
          nodeAtRangeStart.type
        )

        if (
          hasChildrenType !== -1 &&
          nodeAtRangeStart !== editorState.getHeading()
        ) {
          return 'toggle-collapsed'
        }
      }

      return
    }
    case Keys.TAB: {
      const { index: startIndex, offset: startOffset } = editorState.getRangeStart()
      const { index: endIndex, offset: endOffset } = editorState.getRangeEnd()

      /**
       * If range is collapsed but not at the begin of node
       */
      if (
        startIndex === endIndex &&
        (endOffset | startOffset) !== 0
      ) {
        return
      }

      const { id: headingNodeId } = editorState.getHeading()
      const { id: lastNodeId } = editorState.getLast()

      /**
       * We can only move node to the left if selection doesn't
       * contain every nodes of current list
       */
      if (
        headingNodeId !== startIndex &&
        lastNodeId !== endIndex
      ) {
        if (event.shiftKey) {
          return 'move-left'
        }
        return 'move-right'
      }

      return
    }
    case Keys.UP: {
      if (event.shiftKey && event.ctrlKey) {
        const { index: startIndex } = editorState.getRangeStart()
        const headingNode = editorState.getHeading()

        if (startIndex !== headingNode.id) {
          return 'move-up'
        }
      }
      return
    }
    case Keys.DOWN: {
      if (event.shiftKey && event.ctrlKey) {
        const { index: endIndex } = editorState.getRangeEnd()
        const { id: lastNodeId } = editorState.getLast()

        if (endIndex !== lastNodeId) {
          return 'move-down'
        }
      }
      return
    }
    case Keys.LEFT: {
      if (event.altKey) {
        // Prevent browser from going back to previous page
        event.preventDefault()

        // If the current viewing node has level > 1
        // It's means it has parent node, so just jump out
        const headingNode = editorState.getHeading()

        if (headingNode.level > 1) {
          return 'zoom-out'
        }
      }
      return
    }
    case Keys.RIGHT: {
      if (event.altKey) {
        const isCollapsedAt = SelectionManager.rangeIsCollapsedAt(
          editorState.getLocationRange()
        )

        if (!isCollapsedAt) {
          return
        }

        const nodeAtRangeStart = editorState.getNodeForKey(isCollapsedAt)
        const hasChildren = NodeType.hasChildrenTypes.indexOf(
          nodeAtRangeStart.type
        )

        if (
          hasChildren !== -1 &&
          nodeAtRangeStart !== editorState.getHeading()
        ) {
          return 'zoom-in'
        }
      }

      return
    }
    case Keys.BACKSPACE: {
      const isCollapsed = SelectionManager.rangeIsCollapsed(
        editorState.getLocationRange()
      )

      if (!isCollapsed) {
        return 'remove-selection'
      }

      const { index: startIndex, offset: startOffset } = editorState.getRangeStart()
      const nodeAtRangeStart = editorState.getNodeForKey(startIndex)

      if (startOffset === 0) {
        // We just can not delete forward if we are already on the top
        if (nodeAtRangeStart === editorState.getHeading()) {
          return
        }

        const hasChildrenType = NodeType.hasChildrenTypes.indexOf(
          nodeAtRangeStart.type
        )

        if (hasChildrenType !== -1) {
          return 'convert-to-paragraph'
        }

        return 'backspace-content-block'
      }

      if (event.ctrlKey) {
        return 'backspace-word'
      }

      return 'backspace-character'
    }
    case Keys.DELETE: {
      const isCollapsed = SelectionManager.rangeIsCollapsed(
        editorState.getLocationRange()
      )

      if (!isCollapsed) {
        return 'remove-selection'
      }

      const { index: endIndex, offset: endOffset } = editorState.getRangeEnd()
      const nodeAtRangeEnd = editorState.getNodeForKey(endIndex)

      const nodeLength = RichTextUtil.getLength(nodeAtRangeEnd)

      /**
       * We can only trigger deletion
       * if selection is collapsed at the end/begin of current focusing node
       * and that node is not the heading or the last one
       */
      if (endOffset === nodeLength) {
        if (
          endOffset === 0 && /* At the begin */
          nodeAtRangeEnd !== editorState.getHeading()
        ) {
          return 'backspace-content-block'
        }

        if (nodeAtRangeEnd !== editorState.getLast()) {
          return 'delete-content-block'
        }
      }

      if (event.ctrlKey) {
        return 'delete-word'
      }

      return 'delete-character'
    }
    case Keys.GRAVE_ACCENT: {
      const isCollapsedAt = SelectionManager.rangeIsCollapsedAt(
        editorState.getLocationRange()
      )

      const nodeAtCursorLocation = editorState.getNodeForKey(isCollapsedAt)

      // If content of node at cursor location already started with 2 grave accents
      // Press grave accent key again will convert that node into code block
      if (RichTextUtil.nodeContentStartWith(nodeAtCursorLocation, '``')) {
        return 'convert-to-code-block'
      }

      return
    }
    case Keys.B: {
      if (event.ctrlKey) {
        return 'format-bold'
      }
      return
    }
    case Keys.I: {
      if (event.ctrlKey) {
        return 'format-italic'
      }
      return
    }
    case Keys.U: {
      if (event.ctrlKey) {
        return 'format-underline'
      }
      return
    }
    default:
      return
  }
}

export default getKeyCommand
