import LocationRangeUtil from './LocationRangeUtil';

import EditorDOMHandler from 'core/editor/dom';
const DOMUtil = EditorDOMHandler.DOMUtil;

function getNodeFromDOMRange(DOMRange) {
  DOMRange = DOMRange || LocationRangeUtil.getNativeDOMRange();
  return DOMUtil.findClosestElementFromNode(DOMRange.startContainer, {
    matchingSelector: '[data-nodeid]'
  });
}

export default getNodeFromDOMRange;
