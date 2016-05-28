import findNodeAndOffsetFromLocation from './findNodeAndOffsetFromLocation';
import EditorDOMHandler from 'core/editor/dom';

const DOMUtil = EditorDOMHandler.DOMUtil;

export default locationIsCursorTarget(location) {
  const [node, offset] = findNodeAndOffsetFromLocation(location);
  return DOMUtil.nodeIsCursorTarget(node);
}
