import selectionChangeObserver from './utils/selection_change_observer';
import { parse } from './utils/parser';
import * as domHelper from './utils/dom';

import Delta from 'rich-text/lib/delta';

export default class InputController {

  DOM = null;

  delegate = null;

  didUpdate = null;

  inputSummary = null;

  constructor(DOM) {
    this.DOM = DOM;

    this.onTyping = domHelper.handleEvent('keypress', {
      onElement: this.DOM,
      withCallback: (event) => {
        this.inputSummary.updated = false;
        this.inputSummary.composing = false;
      }
    });

    this.onComposingStart = domHelper.handleEvent('compositionstart', {
      onElement: this.DOM,
      withCallback: (event) => {
        this.inputSummary.composing = true;
      }
    });

    this.onComposingUpdate = domHelper.handleEvent('compositionupdate', {
      onElement: this.DOM,
      withCallback: (event) => {
        this.inputSummary.composing = true;
      }
    });

    this.onComposingEnd = domHelper.handleEvent('compositionend', {
      onElement: this.DOM,
      withCallback: (event) => {
        this.inputSummary.updated = false;
        this.inputSummary.composing = false;
      }
    });

    this.resetInputSummary();
  }

  resetInputSummary() {
    this.inputSummary = {
      composing: false,
      updated: true
    };
  }

  locationRangeDidChange(locationRange) {

    if (!locationRange) return;

    const [start, end] = domHelper.rangeFromLocationRange(locationRange);

    if (start === end && this.delegate.cursorToolbar.isShowed) {
      this.delegate.cursorToolbar.hide();
      return;
    }

    clearTimeout(this.showCursorToolbar);
    if (end !== start && !this.inputSummary.composing) {
      const attrs = this.getCommonAttributes([start, end]);
      this.showCursorToolbar = setTimeout(() => {
        const [clientRect] = this.delegate._selectionManager.getClientRectAtLocationRange(locationRange);
        this.delegate.cursorToolbar.show({ clientRect, activeAttributes: attrs });
      }, 400);
    }
  }

  elementDidMutate(mutationSummary) {
    this.inputSummary.updated = false;
    if (!this.inputSummary.composing) {
      console.log(this.delegate.currentNode);
      console.log(mutationSummary);
      this.delegate._activeNode.content = parse(this.delegate.currentNode);
      selectionChangeObserver.reset();
      // Trigger 'update' event after a perior of time
      clearTimeout(this.saveChange);
      this.saveChange = setTimeout(() => this.delegate.inputControllerShouldUpdate({requestSave: true}), 2600);
    }
  }

  getCommonAttributes([start, end] = []) {
    const { ops } = this.delegate.getDelta().slice(start.offset, end.offset);
    const commonAttributes = ops[0].attributes || {};
    if (ops.length === 1) return commonAttributes;
    for (let { attributes } of ops.slice(1)) {
      if (!attributes || !Object.keys(attributes)) return [];
      for (let att in commonAttributes) {
        if (!attributes.hasOwnProperty(att)) {
          commonAttributes[att] = false;
        }
      }
    }
    return commonAttributes;
  }

  dispose() {
    this.onTyping.destroy();
    this.onComposingStart.destroy();
    this.onComposingUpdate.destroy();
    this.onComposingEnd.destroy();
  }
}
