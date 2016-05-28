import createDOMRangeFromLocationRange from './createDOMRangeFromLocationRange'

export default function getClientRectAtLocationRange (locationRange) {
  const range = createDOMRangeFromLocationRange(locationRange)
  if (range) {
    const rects = [...range.getClientRects()]
    return rects.slice(-1)[0]
  }
}
