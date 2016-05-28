function getDOMRange() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
}

function domRangesAreEqual(left, right) {
  if (!left || !right) return false;
  return left.startContainer === right.startContainer
      && left.startOffset === right.startOffset
      && left.endContainer === right.endContainer
      && left.endOffset === right.endOffset;
}

class SelectionChangeObserver {

  constructor() {
    this.selectionManagers = [];
    this.started = false;
  }

  start() {
    if (!this.started) {
      this.started = true;
      if ('onselectionchange' in document) {
        return document.addEventListener('selectionchange', this.update.bind(this), true);
      }
      return this.run();
    }
  }

  stop() {
    if (this.started) {
      this.started = false;
      return document.removeEventListener('selectionchange', this.update.bind(this), true);
    }
  }

  registerSelectionManager(selectionManager) {
    if (this.selectionManagers.indexOf(selectionManager) < 0) {
      this.selectionManagers.push(selectionManager);
      return this.start();
    }
  }

  unregisterSelectionManager(selectionManager) {
    this.selectionManagers = this.selectionManagers.filter(manager => {
      return manager !== selectionManager;
    });
    if (this.selectionManagers.length === 0) {
      return this.stop();
    }
  }

  notifySelectionManagersOfSelectionChange() {
    for (let selectionManager of this.selectionManagers) {
      selectionManager.selectionDidChange();
    }
  }

  update() {
    const domRange = getDOMRange();
    if (!domRangesAreEqual(domRange, this.domRange)) {
      this.domRange = domRange;
      return this.notifySelectionManagersOfSelectionChange();
    }
  }

  reset() {
    this.domRange = null;
    return this.update();
  }

  run() {
    if (this.started) {
      this.update();
      return requestAnimationFrame(this.run);
    }
  }
}

export default new SelectionChangeObserver();
