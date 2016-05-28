import LocationRangeUtil from './LocationRangeUtil';
import createDOMRangeFromLocationRange from './createDOMRangeFromLocationRange';

export default function setLocationRange(container, locationRange) {
  locationRange = LocationRangeUtil.normalizeRange(locationRange);
  const domRange = createDOMRangeFromLocationRange(container, locationRange);
  if (domRange) {
    LocationRangeUtil.setNativeDOMRange(domRange);
  }
}
