import * as domHelper from './utils/dom';

export default class CursorToolbarController {

  delegate = null;

  isShow = false;

  constructor({ element } = {}) {
    this.element = element;
    this.preventHiding = false;
    this.handleEnter = domHelper.handleEvent('mouseenter', {
      onElement: this.element,
      withCallback: (e) => {
        if (this.isShow) {
          this.preventHiding = true;
        }
      }
    });
    this.handleLeave = domHelper.handleEvent('mouseleave', {
      onElement: this.element,
      withCallback: (e) => {
        this.preventHiding = false;
        this.hide();
      }
    });
  }

  hide() {
    if (!this.preventHiding) {
      this.element.classList.remove('show');
      this.isShow = false;
    }
  }

  show({ top, left } = {}) {
    this.element.classList.add('show');
    this.element.style.top = (top - 105) + 'px';
    this.element.style.left = (left - 140) + 'px';
    this.isShow = true;
  }

  dispose() {
    this.handleEnter.destroy();
    this.handleLeave.destroy();
  }
}
