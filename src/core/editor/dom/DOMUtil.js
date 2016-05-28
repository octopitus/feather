const ZERO_WIDTH_SPACE = '\uFEFF'
const DATA_ATTRIBUTE = 'data-offset'

class DOMUtil {
  static query (selector, context) {
    context = context || document
    if (/^(#?[\w-]+|\.[\w-.]+)$/.test(selector)) {
      switch (selector.charAt(0)) {
        case '#':
          return [context.getElementById(selector.substr(1))]
        case '.': {
          const classes = selector.substr(1).replace(/\./g, ' ')
          return [].slice.call(context.getElementsByClassName(classes))
        }
        default:
          return [].slice.call(context.getElementsByTagName(selector))
      }
    }
    return [].slice.call(context.querySelectorAll(selector))
  }

  static match (element, selector) {
    const html = document.documentElement
    const matchesSelector = html.matchesSelector || html.webkitMatchesSelector || html.msMatchesSelector || html.mozMatchesSelector
    return matchesSelector.call(element, selector)
  }

  static nodeLength (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (DOMUtil.nodeIsCursorTarget(node)) {
        return 0
      }
      return node.textContent.length
    } else if (DOMUtil.tagName(node) === 'br' || DOMUtil.nodeIsAttachmentElement(node)) {
      return 1
    } else if (DOMUtil.nodeIsContentBlock(node.previousSibling) && DOMUtil.nodeIsContentBlock(node)) {
      return 1
    }
    return 0
  }

  static nodeIsContentBlock (node) {
    return DOMUtil.isBlockNode(node) && node.hasAttribute(DATA_ATTRIBUTE)
  }

  static isBlockNode (node) {
    return node && node.nodeType === 1 && /^(P|H[1-6]|DIV)$/i.test(node.nodeName)
  }

  static getBlockContainer (node) {
    while (node) {
      if (DOMUtil.isBlockNode(node)) return node
      node = node.parentNode
    }
  }

  static nodeIsCommentNode (node) {
    return node && node.nodeType === Node.COMMENT_NODE
  }

  static nodeIsBlockStartComment (node) {
    return DOMUtil.nodeIsCommentNode(node) && node.data === 'block'
  }

  static nodeIsTextNode (node) {
    return node && node.nodeType === Node.TEXT_NODE
  }

  static nodeIsEmptyTextNode (node) {
    return DOMUtil.nodeIsTextNode(node) && node.data === ''
  }

  static nodeIsBlockContainer (node) {
    return DOMUtil.nodeIsBlockStartComment(node && node.firstChild)
  }

  static nodeIsCursorTarget (node) {
    if (DOMUtil.nodeIsTextNode(node)) {
      return node.data === ZERO_WIDTH_SPACE
    }
    return DOMUtil.nodeIsCursorTarget(node && node.firstChild)
  }

  static nodeIsAttachmentElement (node) {
    // @TODO:40 Re-implement
    return false
  }

  static elementMatchesSelector (element, selector) {
    if (element && element.nodeType === 1) {
      return DOMUtil.match(element, selector)
    }
  }

  static findClosestElementFromNode (node, {matchingSelector} = {}) {
    while (node && node.nodeType !== Node.ELEMENT_NODE) {
      node = node.parentNode
    }
    if (matchingSelector) {
      while (node) {
        if (DOMUtil.elementMatchesSelector(node, matchingSelector)) {
          return node
        }
        node = node.parentNode
      }
    }
    return node
  }

  static findInnerElement (element) {
    while (element && element.firstElementChild) {
      element = element.firstElementChild
    }
    return element
  }

  static innerElementIsActive (element) {
    if (document.activeElement === element) return true
    return document.activeElement.contains(element)
  }

  static elementContainsNode (element, node) {
    if (!(element instanceof Node)) {
      return false
    }

    if (element === node) {
      return true
    }

    return element.contains(node)
  }

  static findNodeFromContainerAndOffset (container, offset) {
    if (!container) {
      return
    }
    if (container.nodeType === Node.TEXT_NODE) {
      return container
    }
    if (offset === 0) {
      return container.firstChild || container
    }
    return container.childNodes.item(offset - 1)
  }

  static findElementFromContainerAndOffset (container, offset) {
    const node = DOMUtil.findNodeFromContainerAndOffset(container, offset)
    return DOMUtil.findClosestElementFromNode(node)
  }

  static findChildIndexOfNode (node) {
    if (!node || !node.parentElement) {
      return -1
    }

    const childNodes = node.parentElement.childNodes

    for (let i = 0; i < childNodes.length; i++) {
      if (node === childNodes.item(i)) {
        return i
      }
    }

    return -1
  }

  static measureElement (element) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight
    }
  }

  static walkTree (tree, {onlyNodesOfType, usingFilter, expandEntityReferences} = {}) {
    const whatToShow = (function () {
      switch (onlyNodesOfType) {
        case 'element':
          return NodeFilter.SHOW_ELEMENT
        case 'text':
          return NodeFilter.SHOW_TEXT
        case 'comment':
          return NodeFilter.SHOW_COMMENT
        default:
          return NodeFilter.SHOW_ALL
      }
    })()
    return document.createTreeWalker(tree, whatToShow, usingFilter || null, expandEntityReferences === true)
  }

  static tagName (element) {
    return element && element.tagName && element.tagName.toLowerCase()
  }

  static makeElement (tag, options = {}) {
    const element = document.createElement(tag)
    if (options.editable) {
      options.attributes = options.attributes || {}
      options.attributes.contenteditable = options.editable
    }
    if (options.attributes) {
      for (let key in options.attributes) {
        element.setAttribute(key, options.attributes[key])
      }
    }
    if (options.style) {
      for (let key in options.style) {
        element.style[key] = options.style[key]
      }
    }
    if (options.data) {
      for (let key in options.data) {
        element.dataset[key] = options.data[key]
      }
    }
    if (options.className) {
      const classes = options.className.split(' ')
      for (let i = 0, len = classes.length; i < len; i++) {
        element.classList.add(classes[i])
      }
    }
    if (options.textContent) {
      element.textContent = options.textContent
    }
    return element
  }

  static cloneFragment (sourceFragment) {
    const fragment = document.createDocumentFragment()
    const childNodes = sourceFragment.childNodes
    for (let i = 0, len = childNodes.length; i < len; i++) {
      const node = childNodes[i]
      fragment.appendChild(node.cloneNode(true))
    }
    return fragment
  }

  static makeFragment (html) {
    const fragment = document.createDocumentFragment()
    const container = document.createElement('div')
    container.innerHTML = html || ''
    let node
    while (node = container.firstChild) {
      fragment.appendChild(node)
    }
    return fragment
  }

  static handleEvent (eventName, {onElement, matchingSelector, withCallback, inPhase, preventDefault, times} = {}) {
    const element = onElement || document
    const selector = matchingSelector
    const callback = withCallback
    const useCapture = inPhase === 'capturing'

    function handler (event) {
      if (times && --times === 0) {
        handler.destroy()
      }
      const target = DOMUtil.findClosestElementFromNode(event.target, {
        matchingSelector: selector
      })
      if (target) {
        if (withCallback) {
          withCallback.call(target, event, target)
        }
        if (preventDefault) {
          return event.preventDefault()
        }
      }
    }

    handler.destroy = function () {
      return element.removeEventListener(eventName, handler, useCapture)
    }

    element.addEventListener(eventName, handler, useCapture)
    return handler
  }

  static handleEventOnce (eventName, options = {}) {
    options.times = 1
    return DOMUtil.handleEvent(eventName, options)
  }

  static triggerEvent (eventName, {onElement, bubbles, cancelable} = {}) {
    const element = onElement !== null ? onElement : document
    bubbles = bubbles !== false
    cancelable = cancelable !== false
    const event = document.createEvent('Events')
    event.initEvent(eventName, bubbles, cancelable)
    return element.dispatchEvent(event)
  }
}

export default DOMUtil
