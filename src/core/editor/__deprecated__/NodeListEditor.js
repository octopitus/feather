import selectionChangeObserver from './utils/selection_change_observer';
import MutationObserver from './MutationObserver';
import InputController from './InputController';
import Composition from './models/Composition';
import SelectionManager from './utils/selection_manager';
import KeyboardHandler from './utils/keyboard_handler';
import CursorToolbarController from './CursorToolbarController';

// @TODO: NodeToolbar
import NodeToolbarController from './NodeToolbarController';

import * as domHelper from './utils/dom';

import core from 'core/store';
const DataStore = core.DataStore;

// @TODO:100 document composition
export default class NodeListEditor {

  delegate = null;

  DOM = null;

  composition = null;

  keyboardHandler = null;

  __inputController = null;

  /**
   * Return the current node under the cursor
   * Same as this.document.findNode(this.currentNode.getAttribute('data-nodeid'))
   * @type {Object}
   */
  _activeNode = null;

  _observer = null;

  _walker = null;

  _afterRenderFunc = [];

  constructor({DOM, documentNodes} = {}) {
    this.DOM = DOM;
    this.document = documentNodes;

    this.cursorToolbar = new CursorToolbarController({
      element: document.getElementById('cursorToolbar')
    });
    this.cursorToolbar.delegate = this;

    this._walker = domHelper.walkTree(this.DOM, {
      onlyNodesOfType: 'element',
      usingFilter: {
        acceptNode(node) {
          // Much faster than using dataset.nodeid
          if (node.hasAttribute('data-nodeid')) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    });

    this.composition = new Composition(documentNodes);
    this.composition.delegate = this;

    this._inputController = new InputController(DOM);
    this._inputController.delegate = this;

    this._observer = new MutationObserver();
    this._observer.delegate = this._inputController;

    this._selectionManager = new SelectionManager(DOM);
    this._selectionManager.delegate = this._inputController;
    selectionChangeObserver.registerSelectionManager(this._selectionManager);

    this.keyboardHandler = new KeyboardHandler(DOM);
    this.keyboardHandler.delegate = this;
    this.keyboardHandler.registerDefaultShortcuts();

    this.onClick = domHelper.handleEvent('click', {
      onElement: this.DOM,
      matchingSelector: '[data-nodeid]',
      preventDefault: true,
      withCallback: (event, target) => {
        // Workaround to make editor update the currentNode
        setTimeout(() => {
          const domRange = this._selectionManager.getDOMRange();

          if (domRange && domRange.collapsed) {
            const node = domHelper.findClosestElementFromNode(domRange.startContainer, {
              matchingSelector: '[data-nodeid]'
            });

            this.focusOnNode(node.getAttribute('data-nodeid'));
          }
        });
      }
    });
  }

  getDelta() {
    return this.composition.compose(this._activeNode.content || []);
  }

  /**
   * Return the current viewing node
   * Same as the route
   * @return {String}
   */
  get currentViewing() {
    return this.document.currentViewing;
  }

  set currentViewing(id) {
    this.document.currentViewing = id;
  }

  /**
   * Current focusing DOM Node
   * @return DOM Node
   */
  get currentNode() {
    return this._walker.currentNode;
  }

  set currentNode(domNode) {
    const node = this.document.findNode(domNode.getAttribute('data-nodeid'));
    this._walker.currentNode = domNode;
    this._selectionManager.element = domNode;
    this._activeNode = node;
  }

  reset() {
    this._observer.reset();
    this._selectionManager.resume();
    return this.focusOnNode(this.currentViewing);
  }

  /**
   * Remove event listeners
   * Clear in-memory data
   * @return {void}
   */
  dispose() {
    this.onClick.destroy();
    this.keyboardHandler.dispose();
    this.cursorToolbar.dispose();
    this._observer.dispose();
    this._inputController.dispose();
    selectionChangeObserver.unregisterSelectionManager(this._selectionManager);
  }

  updateCursorPosition(target) {
    if (this.cursorToolbar.isShowed) this.cursorToolbar.hide();
    selectionChangeObserver.reset();

    this.currentNode = target;
    this._observer.observe(target);
    this._inputController.resetInputSummary();
    // this.prepareForSelecting(target);
  }

  inputControllerShouldUpdate({ requestSave = false } = {}) {
    if (!this.document.has(this._activeNode._id)) return;
    // Trigger event update on document
    if (!this._inputController.inputSummary.updated) {
      this.document.update(this._activeNode._id);
      if (requestSave) this.requestSave();
    }
  }

  requestSave() {
    return this.delegate.editorDidRequestSave();
  }

  requestExport() {
    return this.delegate.editorDidRequestExport();
  }

  requestRender() {
    if (!this.delegate) throw new Error('View layer not found.');
    if (typeof this.delegate.editorDidRequestRender === 'function') {
      this.delegate.editorDidRequestRender();
    }
  }

  requestSelectNode(id = this._activeNode._id) {
    this.delegate.editorDidRequestSelect(id);
  }

  pushEvent(func, ...args) {
    this._afterRenderFunc.push([func, ...args]);
  }

  popEvent() {
    if (this._afterRenderFunc.length) {
      const [eventHandler, ...args] = this._afterRenderFunc.pop();
      if (typeof eventHandler === 'function') {
        eventHandler.apply(this, args);
      }
    }
  }

  moveCursorDown({caretNeedMove = true, locationRange = [0, 0]} = {}) {
    let nextNode;
    do {
      nextNode = this._walker.nextNode();
      if (nextNode && nextNode !== this._walker.root) {
        this.inputControllerShouldUpdate();
        // document.activeElement.blur();
        // nextNode.focus();
        this.updateCursorPosition(nextNode);
        if (caretNeedMove) this._selectionManager.setLocationRange(locationRange);
        this.currentNode = nextNode;
        break;
      }
    } while (nextNode);
  }

  moveCursorUp({caretNeedMove = true, locationRange = [0, 0]} = {}) {
    const prevNode = this._walker.previousNode();
    if (prevNode) {
      this.inputControllerShouldUpdate();
      // document.activeElement.blur();
      // prevNode.focus();
      this.updateCursorPosition(prevNode);
      if (caretNeedMove) this._selectionManager.setLocationRange(locationRange);
      this.currentNode = prevNode;
    }
  }

  focusOnNode(id, { locationRange = [0, 0] } = {}) {
    const maybeNode = this.DOM.querySelector(`[data-nodeid="${id}"]`);
    if (maybeNode) {
      // this.currentNode.focus();
      this.updateCursorPosition(maybeNode);
      // this._selectionManager.setLocationRange(locationRange);
    }
  }
}
