import LocationRangeUtil from './LocationRangeUtil'

import createLocationRange from './createLocationRange'
import setLocationRange from './setLocationRange'
import getLocationRangeAtPoint from './getLocationRangeAtPoint'
import getSelectedPointRange from './getSelectedPointRange'
import getClientRectAtLocationRange from './getClientRectAtLocationRange'
import nodeFromDOMRange from './getNodeFromDOMRange'

const SelectionManager = {
  setLocationRange,
  createLocationRange,
  getLocationRangeAtPoint,
  getSelectedPointRange,
  getClientRectAtLocationRange,
  nodeFromDOMRange,

  getNativeDOMRange: LocationRangeUtil.getNativeDOMRange,
  setNativeDOMRange: LocationRangeUtil.setNativeDOMRange,
  isValidRange: LocationRangeUtil.isValidRange,
  rangeIsCollapsed: LocationRangeUtil.rangeIsCollapsed,
  normalizeRange: LocationRangeUtil.normalizeRange,
  rangesAreEqual: LocationRangeUtil.rangesAreEqual,
  rangeIsCollapsedAt: LocationRangeUtil.rangeIsCollapsedAt
}

export default SelectionManager
