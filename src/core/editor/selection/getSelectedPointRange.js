/**
 * Returns a rectangle enclosing the union
 * of the bounding rectangles for all the elements in the range.
 *
 * @deprecated
 */

import LocationRangeUtil from './LocationRangeUtil'
import EditorDOMHandler from 'core/editor/dom'

const DOMUtil = EditorDOMHandler.DOMUtil

function getCollapsedPointRange () {
  const domRange = LocationRangeUtil.getNativeDOMRange()
  if (!domRange) return
  const cursorPositionPlaceholder = DOMUtil.makeElement({
    tagName: 'span',
    style: {
      marginLeft: '-0.01em'
    }
  })
  const node = cursorPositionPlaceholder.cloneNode(true)
  let rect, start
  try {
    domRange.insertNode(node)
    rect = node.getBoundingClientRect()
  } finally {
    node.parentNode.removeChild(node)
  }
  const value = {x: rect.left, y: rect.top + 1}
  return { start: value, end: value }
}

function getExpandedPointRange () {
  const domRange = LocationRangeUtil.getNativeDOMRange()
  if (!domRange) return
  const rects = domRange.getClientRects()
  if (rects.length > 0) {
    const startRect = rects[0]
    const endRect = rects[rects.length - 1]
    const start = {x: startRect.left, y: startRect.top + 1}
    const end = {x: endRect.right, y: endRect.top + 1}
    return {start, end}
  }
}

export default function getSelectedPointRange () {
  return getCollapsedPointRange() || getExpandedPointRange()
}
