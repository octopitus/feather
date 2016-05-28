import * as domHelper from './dom';
import { editableOnFirstLine, editableOnLastLine } from './caret';

import formatter from '../formats/DocumentFormatter';

import { Delta } from 'rich-text';

let MouseTrap = null;

if (__CLIENT__) {
  MouseTrap = require('mousetrap');
}

const DEFAULT_BEHAVIOR = true;

export default class KeyboardHandler {

  delegate = null;

  mouseTrap = null;

  shortcuts = {};

  getLocationRange = (...args) => this.delegate._selectionManager.getLocationRange(...args);
  getSelectedPointRange = (...args) => this.delegate._selectionManager.getSelectedPointRange(...args);
  findNodeAndOffsetFromLocation = (...args) => this.delegate._selectionManager.findNodeAndOffsetFromLocation(...args);
  findContainerAndOffsetFromLocation = (...args) => this.delegate._selectionManager.findContainerAndOffsetFromLocation(...args);

  getDOMRange = () => this.delegate._selectionManager.getDOMRange();

  constructor(DOM) {
    this.mouseTrap = new MouseTrap(DOM);
  }

  get composer() {
    return this.delegate.composition.compose(this.delegate._activeNode.content);
  }

  register(shortcut, callbackFunc) {
    if (!this.shortcuts[shortcut]) {
      this.shortcuts[shortcut] = true;
      this.mouseTrap.bind(shortcut, (event) => {
        this.delegate.inputControllerShouldUpdate();
        return callbackFunc(event);
      });
    }
  }

  trigger(actionName) {
    if (this.shortcuts[actionName]) {
      this.mouseTrap.trigger(actionName);
    }
  }

  registerDefaultShortcuts() {

    this.register('escape', (event) => {
      if (this.delegate.cursorToolbar.isShowed) {
        this.delegate.cursorToolbar.hide();
        return DEFAULT_BEHAVIOR;
      }
    });

    this.register(['down', 'up'], (event) => {
      // Workaround to make editor update the currentNode
      setTimeout(() => {
        const domRange = this.getDOMRange();

        if (domRange && domRange.collapsed) {
          const node = domHelper.findClosestElementFromNode(domRange.startContainer, {
            matchingSelector: '[data-nodeid]'
          });

          if (node && node.getAttribute('data-nodeid') !== this.delegate.currentViewing) {
            this.delegate.focusOnNode(node.getAttribute('data-nodeid'));
          }
        }
      });
    });

    this.register('mod+b', (event) => {
      this.delegate.cursorToolbar.invokeAction('bold');
      return DEFAULT_BEHAVIOR;
    });

    this.register('mod+i', (event) => {
      this.delegate.cursorToolbar.invokeAction('italic');
      return DEFAULT_BEHAVIOR;
    });

    this.register('mod+u', (event) => {
      this.delegate.cursorToolbar.invokeAction('underline');
      return DEFAULT_BEHAVIOR;
    });

    this.register('enter', (event) => {
      const node = this.delegate._activeNode;
      if (node.type === 'code' || node.type === 'paragraph') {
        return DEFAULT_BEHAVIOR;
      }
      event.preventDefault();
      const [start, end] = this.getLocationRange();
      const currentDelta = new Delta(node.content);
      if (!currentDelta.length() && !start && !end) {
        if (node.parent_id === this.delegate.currentViewing) {
          node.type = 'paragraph';
          return this.delegate.document.move(node._id, {direction: 'LEFT'}).then((nodeIsMoved) => {
            this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
            return this.delegate.requestRender();
          });
        }
        return this.delegate.document.move(node._id, {direction: 'LEFT'}).then((nodeIsMoved) => {
          if (nodeIsMoved) {
            this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
            return this.delegate.requestRender();
          }
        });
      }
      const retainDelta = currentDelta.compose(new Delta().retain(start).delete(currentDelta.length() - start));
      const newDelta = currentDelta.slice(end);
      this.delegate.document.update(node._id, {content: retainDelta.ops});
      // HACK: Hotfix for type 'doc' & 'section'
      const type = node.type === 'doc' || node.type === 'section' ? 'bullet' : node.type;

      if (node._id === this.delegate.currentViewing || (node.children.length && !node.collapsed)) {
        this.delegate.document.addTextNode(newDelta.ops, {parentNode: node._id, type});
        this.delegate.pushEvent(this.delegate.moveCursorDown);
        return this.delegate.requestRender();
      }
      this.delegate.document.addTextNode(newDelta.ops, {parentNode: node.parent_id, type, order: node.order});
      this.delegate.pushEvent(this.delegate.moveCursorDown);
      return this.delegate.requestRender();
    });

    this.register('shift+enter', (event) => {
      event.preventDefault();
      const node = this.delegate._activeNode;
      const [start, end] = this.getLocationRange();
      const currentDelta = new Delta(node.content);
      const retainDelta = currentDelta.compose(new Delta().retain(start).delete(currentDelta.length() - start));
      this.delegate.document.update(node._id, {content: retainDelta.ops});
      const newDelta = currentDelta.slice(start);
      if (node._id === this.delegate.currentViewing || (node.children.length && !node.collapsed)) {
        this.delegate.document.addTextNode(newDelta.ops, {parentNode: node._id, type: 'paragraph'});
        this.delegate.pushEvent(this.delegate.moveCursorDown);
        return this.delegate.requestRender();
      }
      this.delegate.document.addTextNode(newDelta.ops, {parentNode: node.parent_id, type: 'paragraph', order: node.order});
      this.delegate.pushEvent(this.delegate.moveCursorDown);
      return this.delegate.requestRender();
    });

    this.register('mod+enter', event => {
      alert('mark as complete for check node');
    });

    this.register('backspace', (event) => {
      const [start, end] = this.getLocationRange();
      // Range is collapsed and is at the begining of line
      if (!start && !end) {
        event.preventDefault();
        const node = this.delegate._activeNode;
        const current = new Delta(node.content);
        const prevNode = this.delegate.document.getPrevNode(node._id);
        if (!node.children.length && node._id !== this.delegate.currentViewing) {
          if (node.type === 'bullet') {
            node.type = 'paragraph';
            return this.delegate.document.move(node._id, {direction: 'UP', appendToPrev: true}).then((nodeIsMoved) => {
              this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
              return this.delegate.requestRender();
            });
          }
          return this.delegate.document.remove(node._id).then((removedNodes) => {
            if (removedNodes && removedNodes.length) {
              const prev = new Delta(prevNode.content);
              this.delegate.document.update(prevNode._id, {content: prev.concat(current).ops});
              if (current.length()) {
                this.delegate.moveCursorUp({caretNeedMove: false});
                this.delegate.pushEvent(() => {
                  this.delegate._selectionManager.setLocationRange(prev.length());
                });
              } else {
                this.delegate.moveCursorUp({locationRange: prev.length()});
              }
              return this.delegate.requestRender();
            }
          });
        }
        return !DEFAULT_BEHAVIOR;
      }
      return DEFAULT_BEHAVIOR;
    });

    this.register('ctrl+shift+backspace', (event) => {
      event.preventDefault();
      const { _id } = this.delegate._activeNode;
      const [start, end] = this.getLocationRange();
      if (!start && !end && _id && this.delegate.currentViewing) {
        this.delegate.document.remove(_id).then(removedNodes => {
          this.delegate.moveCursorUp();
          return this.delegate.requestRender();
        });
      }
    });

    this.register('mod+space', (event) => {
      const node = this.delegate._activeNode;
      if (node._id !== this.delegate.currentViewing && node.children.length) {
        this.delegate.document.update(node._id, {collapsed: !node.collapsed});
        return this.delegate.requestRender();
      }
    });

    this.register('mod+shift+up', (event) => {
      const node = this.delegate._activeNode;
      const { parent_id } = node;
      if (node._id !== this.delegate.currentViewing) {
        return this.delegate.document.move(node._id, {direction: 'UP'}).then((nodeIsMoved) => {
          if (nodeIsMoved) {
            // If this node is moved out of its parent
            if (node.parent_id !== parent_id) this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
            return this.delegate.requestRender();
          }
        });
      }
    });

    this.register('mod+shift+down', (event) => {
      const node = this.delegate._activeNode;
      const { parent_id } = node;
      if (node._id !== this.delegate.currentViewing) {
        return this.delegate.document.move(node._id, {direction: 'DOWN'}).then((nodeIsMoved) => {
          if (nodeIsMoved) {
            // If this node is moved out of its parent
            if (node.parent_id !== parent_id) this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
            return this.delegate.requestRender();
          }
        });
      }
    });

    this.register('tab', (event) => {
      event.preventDefault();
      if (this.delegate._activeNode.type === 'code') {
        document.execCommand('insertText', false, '    ');
        return DEFAULT_BEHAVIOR;
      }
      const locationRange = this.getLocationRange();
      if (domHelper.rangesAreEqual(locationRange, 0)) {
        const node = this.delegate._activeNode;
        if (node.type === 'bullet') {
          return this.delegate.document.move(node._id, {direction: 'RIGHT'}).then((nodeIsMoved) => {
            if (nodeIsMoved) {
              this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
              return this.delegate.requestRender();
            }
          });
        }
        this.delegate.document.update(node._id, {type: 'bullet'});
        this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
        return this.delegate.requestRender();
      }
    });

    this.register('shift+tab', event => {
      event.preventDefault();
      const locationRange = this.getLocationRange();
      if (domHelper.rangesAreEqual(locationRange, 0)) {
        const node = this.delegate._activeNode;
        return this.delegate.document.move(node._id, {direction: 'LEFT'}).then((nodeIsMoved) => {
          if (nodeIsMoved) {
            this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
            return this.delegate.requestRender();
          }
        });
      }
    });

    this.register('` ` `', (event) => {
      const node = this.delegate._activeNode;
      const [start, end] = this.getLocationRange();
      if (node.type !== 'code' && !node.children.length && start === 2 && end === 2) {
        event.preventDefault();
        const { ops } = this.delegate.getDelta().slice(2);
        this.delegate.document.update(node._id, {type: 'code', content: ops });
        this.delegate.pushEvent(this.delegate.focusOnNode, node._id);
        return this.delegate.requestRender();
      }
      return DEFAULT_BEHAVIOR;
    });

    this.register('[ ] tab', (event) => {
      event.preventDefault();
      const [start, end] = this.getLocationRange();
      if (domHelper.rangesAreEqual([start, end], 2)) {
        window.alert('convert to task');
        return !DEFAULT_BEHAVIOR;
      }
      return DEFAULT_BEHAVIOR;
    });
  }

  dispose() {
    for (let key in Object.keys(this.shortcuts)) {
      this.mouseTrap.unbind(key);
    }
  }
}
