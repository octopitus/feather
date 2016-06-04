import DOMUtil from './DOMUtil'
import invariant from 'invariant'

// Block tag flow is different because LIs do not have
// a deterministic style ;_;
const INLINE_TAGS = {
  b: 'bold',
  code: 'code',
  del: 'strikethrough',
  em: 'italic',
  i: 'italic',
  s: 'strikethrough',
  strike: 'strikethrough',
  strong: 'bold',
  u: 'underline',
};

function isValidAnchorNode(link) {
  invariant(
    link instanceof HTMLAnchorElement,
    'Link must be an HTMLAnchorElement.'
  )

  const protocol = link.protocol;
  return protocol === 'http:' || protocol === 'https:';
}

function retrieveNodeAttribute (node) {
  const tagName = DOMUtil.tagName(node)
  switch (tagName) {
    case 'b':
    case 'code':
    case 'del':
    case 'em':
    case 'i':
    case 's':
    case 'strike':
    case 'strong':
      return {
        [INLINE_TAGS[tagName]]: true
      }
    case 'a':
      if (isValidAnchorNode(node)) {
        return { link: node.href }
      }
    default:
      if (node instanceof HTMLElement) {
        if (node.style.fontWeight === 'bold') {
          return { bold: true }
        }

        if (node.style.fontStyle === 'italic') {
          return { italic: true }
        }

        if (node.style.textDecoration === 'underline') {
          return { underline: true }
        }

        if (node.style.textDecoration === 'line-through') {
          return { strikethrough: true }
        }
      }

      return {}
  }
}

function parse (node, outerScope) {
  let ops = []

  if (!outerScope) {
    outerScope = retrieveNodeAttribute(node)
  }

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      ops.push({insert: child.data, attributes: outerScope})
      continue
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = DOMUtil.tagName(child)

      switch (tagName) {
        case 'br':
          ops.push({insert: '\n'})
          break
        case 'img':
          ops.push({
            insert: 1,
            attributes: {
              image: child.getAttribute('src'),
              alt: child.getAttribute('alt')
            }
          })
          break
        default:
          if (child.hasChildNodes()) {
            const attrs = {...outerScope, ...retrieveNodeAttribute(child)}
            ops = ops.concat(parse(child, attrs))
            if (
              DOMUtil.isBlockNode(child) &&
              child.nextSibling instanceof HTMLElement
            ) {
              ops.push({insert: '\n'})
            }
          }
          break
      }

      continue
    }
  }
  return ops
}

export default (html) => parse(DOMUtil.makeFragment(html))
