import createLocationRange from './createLocationRange';
import LocationRangeUtil from './LocationRangeUtil';

export default function getLocationRangeAtPoint({x, y} = {}) {
  let domRange;
  if (document.caretPositionFromPoint) {
    const caret = document.caretPositionFromPoint(x, y);
    domRange = document.createRange();
    domRange.setStart(caret.offsetNode, caret.offset);
  } else if (document.caretRangeFromPoint) {
    domRange = document.caretRangeFromPoint(x, y);
  } else if (document.body.createTextRange) {
    const originalDOMRange = LocationRangeUtil.getNativeDOMRange();
    try {
      const textRange = document.body.createTextRange();
      textRange.moveToPoint(x, y);
      textRange.select();
    } catch (_) {
      //
    }
    domRange = LocationRangeUtil.getNativeDOMRange();
    LocationRangeUtil.setNativeDOMRange(originalDOMRange);
  }
  return createLocationRange(domRange);
}
