/**
 * @deprecated
 */

import DOMUtils from 'core/editor/dom/DOMUtils';

class DOMCaretUtils {
  static extractContents(element) {
    const sel = global.getSelection();
    let before, after;
    if (sel.rangeCount) {
      const selRange = sel.getRangeAt(0);
      const blockEl = element || dom.getBlockContainer(selRange.endContainer);
      if (blockEl) {
        const preRange = document.createRange();
        preRange.selectNodeContents(blockEl);
        preRange.setEnd(selRange.endContainer, selRange.endOffset);
        after = preRange.extractContents();

        const postRange = document.createRange();
        postRange.selectNodeContents(blockEl);
        postRange.setStart(selRange.endContainer, selRange.endOffset);
        before = postRange.extractContents();
      }
    }
    // Return 2 DocumentFragments
    return { before, after };
  }

  static hasCaret() {
    return global.getSelection().type === 'Caret';
  }

  static preCaretText(element) {
    const sel = global.getSelection();
    let preCaret = '';
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      preCaret = range.cloneRange();
      preCaret.selectNodeContents(element);
      preCaret.setEnd(range.endContainer, range.endOffset);
    }
    return preCaret;
  }

  static postCaretText(element) {
    const sel = global.getSelection();
    let preCaret = '';
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      preCaret = range.cloneRange();
      preCaret.selectNodeContents(element);
      preCaret.setStart(range.endContainer, range.endOffset);
    }
    return preCaret;
  }

  static getCaretPosition(element) {
    return DOMCaretUtils.preCaretText(element).toString().length;
  }

  static moveCaretTo(element, toStart = false) {
    const range = document.createRange();
    const selection = global.getSelection();
    range.selectNodeContents(element);
    range.collapse(toStart);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  static caretAtStart(node, range) {
    const preRange = document.createRange();
    preRange.selectNodeContents(node);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length === 0;
  }

  static caretAtEnd(node, range) {
    const postRange = document.createRange();
    postRange.selectNodeContents(node);
    postRange.setStart(range.endContainer, range.endOffset);
    return postRange.toString().length === 0;
  }

  static getEditableCaretRange() {
    const sel = global.getSelection();
    return sel.getRangeAt(0);
  }

  static setEditableCaretRange(range) {
    const sel = global.getSelection();
    if (sel.rangeCount > 0) {
      sel.removeAllRanges();
    }
    return sel.addRange(range);
  }

  static editableCaretAtStart(node) {
    return DOMCaretUtils.caretAtStart(node, DOMCaretUtils.getEditableCaretRange());
  }

  static editableCaretAtEnd(node) {
    return DOMCaretUtils.caretAtEnd(node, DOMCaretUtils.getEditableCaretRange());
  }

  static editableOnFirstLine(node, {lineHeight = 20} = {}) {
    let ctop, etop, range;
    range = DOMCaretUtils.getEditableCaretRange();
    if (!range) {
      return false;
    }
    if (DOMCaretUtils.caretAtStart(node, range)) {
      return true;
    } else if (DOMCaretUtils.caretAtEnd(node, range)) {
      ctop = node.getBoundingClientRect().bottom - lineHeight;
    } else {
      ctop = range.getClientRects()[0].top;
    }
    etop = node.getBoundingClientRect().top;
    return ctop < etop + lineHeight;
  }

  static editableOnLastLine(node, {lineHeight = 20} = {}) {
    let cbtm, ebtm, range;
    range = DOMCaretUtils.getEditableCaretRange();
    if (!range) {
      return false;
    }
    if (DOMCaretUtils.caretAtEnd(node, range)) {
      return true;
    } else if (DOMCaretUtils.caretAtStart(node, range)) {
      cbtm = node.getBoundingClientRect().top + lineHeight;
    } else {
      cbtm = range.getClientRects()[0].bottom;
    }
    ebtm = node.getBoundingClientRect().bottom;
    return cbtm > ebtm - lineHeight;
  }
}

export default DOMCaretUtils;
