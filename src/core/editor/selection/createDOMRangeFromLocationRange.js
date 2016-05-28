import LocationRangeUtil from './LocationRangeUtil';
import findContainerAndOffsetFromLocation from './findContainerAndOffsetFromLocation';

export default function createDOMRangeFromLocationRange(container, locationRange) {
  const {start, end} = LocationRangeUtil.normalizeRange(locationRange);
  const rangeStart = findContainerAndOffsetFromLocation(container, start);

  let rangeEnd;
  if (LocationRangeUtil.rangeIsCollapsed(locationRange)) {
    rangeEnd = rangeStart;
  } else {
    rangeEnd = findContainerAndOffsetFromLocation(container, end);
  }

  if (rangeStart && rangeEnd) {
    const domRange = document.createRange();
    domRange.setStart(...rangeStart);
    domRange.setEnd(...rangeEnd);
    return domRange;
  }
}
