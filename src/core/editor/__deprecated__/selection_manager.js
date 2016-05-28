import selectionChangeObserver from './selection_change_observer';
import {
  elementContainsNode,
  handleEvent,
  handleEventOnce,
  innerElementIsActive,
  makeElement,
  nodeIsCursorTarget,
  normalizeRange,
  rangeIsCollapsed,
  rangesAreEqual,
  rangeFromLocationRange
} from './dom';

import LocationMapper from './location_mapper';

function getDOMSelection() {
  return window.getSelection();
}

function getDOMRange() {
  const sel = getDOMSelection();
  if (sel.rangeCount > 0) {
    return sel.getRangeAt(0);
  }
}

function getClientRects() {
  const domRange = getDOMRange();
  if (!domRange) return;
  const rects = domRange.getClientRects();
  if (rects && rects.length) return rects;
}

function getCollapsedPointRange() {
  const domRange = getDOMRange();
  if (!domRange) return;
  const cursorPositionPlaceholder = makeElement({
    tagName: 'span',
    style: {
      marginLeft: '-0.01em'
    }
  });
  const node = cursorPositionPlaceholder.cloneNode(true);
  let rect, start;
  try {
    domRange.insertNode(node);
    rect = node.getBoundingClientRect();
  } finally {
    node.parentNode.removeChild(node);
  }
  return normalizeRange([{x: rect.left, y: rect.top + 1}]);
}

function getExpandedPointRange() {
  const domRange = getDOMRange();
  if (!domRange) return;
  const rects = domRange.getClientRects();
  if (rects.length > 0) {
    const startRect = rects[0];
    const endRect = rects[rects.length - 1];
    const start = {x: startRect.left, y: startRect.top + 1};
    const end = {x: endRect.right, y: endRect.top + 1};
    return [start, end];
  }
}

export default class SelectionManager extends LocationMapper {

  DOM = null;

  constructor(DOM) {
    super();

    this.lockCount = 0;
    this.DOM = DOM;

    handleEvent('keydown', {
      onElement: DOM,
      withCallback: (event) => {
        this.paused = true;
        this.boostrapResumeHandlers();
        this.resumeTimeout = setTimeout(this.resume.bind(this), 200);
      }
    });
  }

  boostrapResumeHandlers() {
    this.resumeHandlers = ['mousemove', 'keydown'].map((eventName) => {
      return handleEvent(eventName, {onElement: this.DOM, withCallback: this.resume.bind(this)});
    });
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      clearTimeout(this.resumeTimeout);
      for (const handler of this.resumeHandlers) handler.destroy();
      this.selectionDidChange();
    }
  }

  // Public API for delegator
  getDOMRange() {
    return getDOMRange();
  }

  getLocationRange({ ignoreLock = true } = {}) {
    if (ignoreLock) return rangeFromLocationRange(this.currentLocationRange);
    return rangeFromLocationRange(this.lockedLocationRange || this.currentLocationRange);
  }

  setLocationRange(locationRange) {
    if (!this.lockedLocationRange) {
      locationRange = normalizeRange(locationRange);
      const domRange = this.createDOMRangeFromLocationRange(locationRange);
      if (domRange) {
        setDOMRange(domRange);
        return this.updateCurrentLocationRange(locationRange);
      }
    }
  }

  // @TODO:20 Debug this function
  getSelectedPointRange() {
    return getExpandedPointRange() || getCollapsedPointRange();
  }

  getClientRectAtLocationRange(locationRange) {
    const range = this.createDOMRangeFromLocationRange(locationRange);
    if (range) {
      const rects = [...range.getClientRects()];
      return rects.slice(-1)[0];
    }
  }

  locationIsCursorTarget(location) {
    const [node, offset] = this.findNodeAndOffsetFromLocation(location);
    return nodeIsCursorTarget(node);
  }

  lock() {
    if (!this.lockCount) {
      this.updateCurrentLocationRange();
      this.lockedLocationRange = this.getLocationRange();
    }
    this.lockCount = this.lockCount + 1;
  }

  unlock() {
    this.lockCount = this.lockCount - 1;
    if (!this.lockCount) {
      const lockedLocationRange = this.lockedLocationRange;
      this.lockedLocationRange = null;
      if (lockedLocationRange) {
        return this.setLocationRange(lockedLocationRange);
      }
    }
  }

  clearSelection() {
    const DOMSelection = getDOMSelection();
    if (DOMSelection) DOMSelection.removeAllRanges();
    return this.selectionDidChange();
  }

  selectionIsCollapsed() {
    const DOMSelection = getDOMSelection();
    if (!DOMSelection) return false;
    return DOMSelection.isCollapsed;
  }

  selectionIsExpanded() {
    return !this.selectionIsCollapsed();
  }

  selectionDidChange() {
    if (!this.paused && innerElementIsActive(this.DOM)) {
      return this.updateCurrentLocationRange();
    }
  }

  updateCurrentLocationRange(locationRange) {
    locationRange = locationRange || this.createLocationRangeFromDOMRange(getDOMRange());
    if (!rangesAreEqual(locationRange, this.currentLocationRange)) {
      this.currentLocationRange = locationRange;
      if (this.delegate && typeof this.delegate.locationRangeDidChange === 'function') {
        this.delegate.locationRangeDidChange(locationRange && locationRange.slice());
      }
    }
  }

  createDOMRangeFromLocationRange(locationRange) {
    let rangeEnd, rangeStart;
    rangeStart = this.findContainerAndOffsetFromLocation(locationRange[0]);
    if (rangeIsCollapsed(locationRange)) {
      rangeEnd = rangeStart;
    } else {
      rangeEnd = this.findContainerAndOffsetFromLocation(locationRange[1]);
    }
    if (rangeStart && rangeEnd) {
      const domRange = document.createRange();
      domRange.setStart(...rangeStart);
      domRange.setEnd(...rangeEnd);
      return domRange;
    }
  }

  createLocationRangeFromDOMRange(domRange) {
    if (!domRange) return;
    let start, end;
    start = this.findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset);
    if (!start) return;
    if (!domRange.collapsed) {
      end = this.findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset);
    }
    return normalizeRange([start, end]);
  }

  /**
   * @deprecated
   */
  setLocationRangeFromPointRange(pointRange) {
    pointRange = normalizeRange(pointRange);
    const startRange = this.getLocationRangeAtPoint(pointRange[0]);
    const startLocation = startRange && startRange[0];
    const endRange = this.getLocationRangeAtPoint(pointRange[1]);
    const endLocation = endRange && endRange[0];
    return this.setLocationRange([startLocation, endLocation]);
  }
}
