import EditorDOMHandler from 'core/editor/dom';
const DOMUtil = EditorDOMHandler.DOMUtil;

export default function domRangeWithinElement(domRange) {
  if (domRange.collapsed) {
    return DOMUtil.elementContainsNode(this.DOM, domRange.startContainer);
  }
  return DOMUtil.elementContainsNode(this.DOM, domRange.startContainer)
      && DOMUtil.elementContainsNode(this.DOM, domRange.endContainer);
}
