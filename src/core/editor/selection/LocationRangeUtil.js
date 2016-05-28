class LocationRangeUtil {
  static getNativeDOMRange() {
    const selection = global.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
  }

  static setNativeDOMRange(domRange) {
    const selection = global.getSelection();
    selection.removeAllRanges();
    selection.addRange(domRange);
  }

  static copyValues(index, offset = 0) {
    return {index, offset};
  }

  static isValidRange(range) {
    range = LocationRangeUtil.normalizeRange(range);
    return range.start && range.end;
  }

  static rangeValuesAreEqual(left, right) {
    return left.index === right.index &&
           left.offset === right.offset;
  }

  static normalizeRange(range) {
    if (typeof range === 'string') {
      const value = LocationRangeUtil.copyValues(range);
      return { start: value, end: value };
    }

    if (range.index) {
      const value = LocationRangeUtil.copyValues(range.index, range.offset);
      return { start: value, end: value };
    }

    return range;
  }

  static rangeIsCollapsed(range) {
    const { start, end } = LocationRangeUtil.normalizeRange(range);
    return LocationRangeUtil.rangeValuesAreEqual(start, end);
  }

  static rangesAreEqual(leftRange, rightRange) {
    const { start: leftStart, end: leftEnd } = LocationRangeUtil.normalizeRange(leftRange);
    const { start: rightStart, end: rightEnd } = LocationRangeUtil.normalizeRange(rightRange);
    return LocationRangeUtil.rangeValuesAreEqual(leftStart, rightStart) &&
           LocationRangeUtil.rangeValuesAreEqual(leftEnd, rightEnd);
  }

  static rangeIsCollapsedAt(range) {
    const { start, end } = LocationRangeUtil.normalizeRange(range);
    if (start.index === end.index) {
      return start.index;
    }
  }
}

export default LocationRangeUtil;
