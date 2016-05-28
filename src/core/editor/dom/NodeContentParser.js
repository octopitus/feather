/**
 * Returns an array indicate the content of node
 */

import DOMUtil from './DOMUtil';
import invariant from 'invariant';

function retrieveNodeAttribute(node) {
  switch (DOMUtil.tagName(node)) {
    case 'b':
    case 'strong':
      return {bold: true};
    case 'i':
    case 'em':
      return {italic: true};
    case 'u':
      return {underline: true};
    case 's':
    case 'del':
      return {strikethrough: true};
    default:
      return {};
  }
}

function parse(node, outerScope) {
  let ops = [];
  if (!outerScope) outerScope = retrieveNodeAttribute(node);
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      ops.push({insert: child.data, attributes: outerScope});
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = DOMUtil.tagName(child);
      switch (tagName) {
        case 'br':
          if (child.textContent) ops.push({insert: '\n'});
          break;
        case 'img':
          ops.push({
            insert: 1, attributes: {
              image: child.getAttribute('src'),
              alt: child.getAttribute('alt')
            }
          });
          break;
        case 'i':
        case 'em':
        case 'b':
        case 'strong':
        case 'u':
        case 's':
          if (child.hasChildNodes()) {
            const attrs = {...outerScope, ...retrieveNodeAttribute(child)};
            ops = ops.concat(parse(child, attrs));
          }
          break;
        default:
          if (child.hasChildNodes()) {
            ops = ops.concat(parse(child, outerScope));
            if (DOMUtil.nodeIsContentBlock(child) && DOMUtil.nodeIsContentBlock(child.nextSibling)) {
              ops.push({insert: '\n'});
            }
          }
          break;
      }
    }
  }
  return ops;
}

export default function validateBeforeParse(node) {
  invariant(
    node instanceof HTMLElement,
    `Node must be an instanceof of HTMLElement. ${node.constructor.name} was given.`
  );
  return parse(node);
}
