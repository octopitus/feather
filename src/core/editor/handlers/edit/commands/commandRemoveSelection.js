import SelectionManager from 'core/editor/selection';
import RichTextUtil from 'core/editor/utils/RichTextUtil';

import store from 'core/store'
import editor from 'core/editor'

const EditorState = editor.EditorState

const DataStore = store.DataStore;
const Node = store.Node;

/**
 * Delete content in selection
 * Returns new EditorState
 */
function commandRemoveSelection(editorState) {
  const nodesList = editorState.getNodesList();
  const { start, end } = editorState.getLocationRange();

  const nodeAtRangeStart = nodesList.get(start.index);

  // If selection is not collapsed but stands in one node
  // Keep the content before the startOffset
  // and delete the content inside selection
  if (start.index === end.index) {
    const operators = RichTextUtil.build((delta) =>
      delta.retain(start.offset).delete(end.offset - start.offset)
    );

    const nodeAppliedOperators = new Node(nodeAtRangeStart).compose(operators);
    newNodesList = nodesList.set(start.index, nodeAppliedOperators.toObject());

    return EditorState.update(editorState, {
      nodesList: newNodesList,
      locationRange: SelectionManager.normalizeRange(start)
    });
  }

  const nodeAtRangeEnd = nodesList.get(end.index);

  // If the selection includes every nodes of current nodelist
  // @TODO: Handle ctrl + a key stroke
  if (
    nodeAtRangeStart === editorState.getHeading() &&
    nodeAtRangeEnd === editorState.getLast()
  ) {
    return editorState;
  }

  const keySeq = nodesList.keySeq();
  const indexOfStart = keySeq.indexOf(start.index);
  const indexOfEnd = keySeq.indexOf(end.index);

  let newNodesList = nodesList.withMutations(state => {
    const { content: startContentSliced } = Node.slice(0, start.offset, nodeAtRangeStart);
    const { content: endContentSliced } = Node.slice(end.offset, nodeAtRangeEnd);

    const nodeAppliedOperators = new Node({
      ...nodeAtRangeStart,
      after: nodeAtRangeEnd.after,
      content: startContentSliced.concat(endContentSliced)
    });

    state.set(start.index, nodeAppliedOperators.toObject());

    // Link the node after node at range end
    // to the node at range start
    if (nodeAtRangeEnd.after !== null) {
      const nodeAfterRangeEnd = state.get(nodeAtRangeEnd.after);
      state.set(nodeAfterRangeEnd.id, {
        ...nodeAfterRangeEnd,
        before: start.index
      });
    }
  });

  newNodesList = newNodesList.toList().splice(indexOfStart + 1, indexOfEnd - indexOfStart);

  return EditorState.update(editorState, {
    nodesList: newNodesList,
    locationRange: SelectionManager.normalizeRange(start)
  });
}

export default commandRemoveSelection;
