import commandRemoveSelection from './commandRemoveSelection'
import commandRemoveWithStrategy from './commandRemoveWithStrategy'
import commandRemoveBlock from './commandRemoveBlock'
import commandConvertToType from './commandConvertToType'
import commandInsertBreakline from './commandInsertBreakline'
import commandInsertNode from './commandInsertNode'
import commandIncreaseIndentLevel from './commandIncreaseIndentLevel'
import commandDecreaseIndentLevel from './commandDecreaseIndentLevel'
import commandMoveDownNodesInSelection from './commandMoveDownNodesInSelection'
import commandMoveUpNodesInSelection from './commandMoveUpNodesInSelection'
import commandFormatText from './commandFormatText'

export default {
  // Trigger when press backspace or delete
  // while selection is not collapsed
  removeSelection: commandRemoveSelection,

  // Same as above but while selection is collapsed
  removeCharBackward: commandRemoveWithStrategy.bind(null, 1, true),
  removeCharForward: commandRemoveWithStrategy.bind(null, 1, false),

  // Same, but when 'ctrl' also pressed
  removeWordBackward: commandRemoveWithStrategy.bind(null, null, true),
  removeWordForward: commandRemoveWithStrategy.bind(null, null, false),

  // Trigger when press backspace at the begin of node
  // and that node is a paragraph or code block
  removeBlockBackward: commandRemoveBlock.bind(null, 'backward'),

  // Trigger when press delete at the end of node
  // not depends on type of node
  removeBlockForward: commandRemoveBlock.bind(null, 'forward'),

  // Trigger when press backspace at the begin of node
  convertToParagraph: commandConvertToType.bind(null, 'paragraph'),
  convertToCodeBlock: commandConvertToType.bind(null, 'code'),

  // Trigger when press enter inside a paragraph or a code block
  insertBreakline: commandInsertBreakline,

  // Same as above but inside a bullet
  insertBullet: commandInsertNode.bind(null, 'bullet'),

  // Same, but when 'shift' also pressed
  insertParagraph: commandInsertNode.bind(null, 'paragraph'),

  // Press tab while selection is collapsed (or not)
  increaseIndentLevel: commandIncreaseIndentLevel,
  decreaseIndentLevel: commandDecreaseIndentLevel,

  // ctrl+shift+up (down)
  moveDownNodesInSelection: commandMoveDownNodesInSelection,
  moveUpNodesInSelection: commandMoveUpNodesInSelection,

  formatText: commandFormatText,
}
