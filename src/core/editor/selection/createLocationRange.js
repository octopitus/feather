import findLocationFromContainerAndOffset from './findLocationFromContainerAndOffset'
import LocationRangeUtil from './LocationRangeUtil'

export default function createLocationRange (domRange) {
  domRange = domRange || LocationRangeUtil.getNativeDOMRange()

  if (domRange == null) { // eslint-disable-line eqeqeq
    return
  }

  const start = findLocationFromContainerAndOffset(
    domRange.startContainer, domRange.startOffset
  )

  if (domRange.isCollapsed) {
    return { start, end: start }
  }

  const end = findLocationFromContainerAndOffset(
    domRange.endContainer, domRange.endOffset
  )

  return { start, end }
}
