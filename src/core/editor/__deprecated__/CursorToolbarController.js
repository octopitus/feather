import * as domHelper from './utils/dom';
import Delta from 'rich-text/lib/delta';

import formatter from './formats/DocumentFormatter';

export default class CursorToolbarController {

  delegate = null;

  isShowed = false;

  actions = {
    bold: 'mod+b',
    italic: 'mod+i',
    underline: 'mod+u',
    strikethrough: true /* without keyboard shortcut */
  };

  constructor({ element } = {}) {
    this.element = element;
  }

  dispose() {
    this.actionHandler.destroy();
  }

  hide() {
    this.isShowed = false;
    const buttons = this.element.querySelectorAll('[data-action]');
    for (const button of buttons) button.classList.remove('active');
    this.element.classList.remove('show', 'transition');
    if (this.actionsHandler) this.actionsHandler.destroy();
  }

  show({ clientRect, activeAttributes } = {}) {
    this.element.classList.add('show');
    const { width, height } = window.getComputedStyle(this.element);
    // @Hack: move CursorToolbar into NodeList component
    this.element.style.left = `${clientRect.left + (clientRect.width / 2) - 405}px`;
    this.element.style.top = `calc(${clientRect.top - 50}px - ${height})`;
    this.isShowed = true;

    if (activeAttributes) {
      for (const attr of Object.keys(activeAttributes)) {
        if (activeAttributes[attr]) {
          const button = this.getInvokeButton(attr);
          button.classList.add('active');
        }
      }
    }

    this.actionsHandler = this.handleClickActionButtions();

    setTimeout(() => {
      this.element.classList.add('transition');
    }, 1000 / 60);
  }

  handleClickActionButtions() {
    return domHelper.handleEvent('mousedown', {
      onElement: this.element,
      matchingSelector: '[data-action]',
      withCallback: (event, target) => {
        event.preventDefault();
        const action = target.getAttribute('data-action');
        if (action) this.invokeAction(action, true);
      }
    });
  }

  invokeAction(actionName, forceUpdate = false) {
    const invoker = this.getInvokeButton(actionName);
    const didActive = invoker.classList.toggle('active');
    /* Replace innerHTML of currentNode */
    const [start, end] = this.delegate._selectionManager.getLocationRange();
    const delta = this.delegate.getDelta();
    const activeAttributes = this.getActiveAttributes();
    activeAttributes[actionName] = didActive || null;
    const newDelta = new Delta().retain(start).retain(end - start, activeAttributes);
    const { ops } = delta.compose(newDelta);
    this.delegate.document.update(
      this.delegate._activeNode._id,
      { content: ops }
    );
    if (forceUpdate) {
      this.delegate.currentNode.innerHTML = formatter.format(ops).to('html');
      this.delegate._selectionManager.setLocationRange([start, end]);
    }
  }

  getActiveAttributes() {
    const activeAttributes = {};
    for (const button of this.element.querySelectorAll('[data-action]')) {
      if (domHelper.elementMatchesSelector(button, '.active')) {
        const action = button.getAttribute('data-action');
        activeAttributes[action] = true;
      }
    }
    return activeAttributes;
  }

  getInvokeButton(actionName) {
    if (!this.actions[actionName]) throw new Error(`${actionName} is undefined`);
    return this.element.querySelector(`[data-action="${actionName}"]`);
  }
}
