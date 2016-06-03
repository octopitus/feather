import format from 'stringformat'

export const defaults = {
  line: '<p data-offset={line}>{content}</p>',
  text: '<span style="{style}">{content}</span>',
  link: '<a href="{link}">{content}</a>',
  styleTags: {
    color: '<span style="color:{color}">{content}</span>',
    bold: '<strong>{content}</strong>',
    italic: '<em>{content}</em>',
    underline: '<u>{content}</u>',
    strikethrough: '<s>{content}</s>',
    font: '<span style="font-family:{font}">{content}</span>'
  },
  embed: {
    1: '<img src="{image}" alt="{alt}" />'
  }
}

export function processLine (line, options, index) {
  const attributes = Object.keys(line.attributes || { })

  // Builds the content of the line
  function contentMap (op) {
    if (typeof op.insert === 'number') {
      return format(options.embed[op.insert] || '', op.attributes || { })
    }
    if (!op.attributes) return op.insert
    return drawTextHtml(op.insert, op.attributes)
  }

  // Render a section of text using style HTML
  function drawTextHtml (content, attrs) {
    Object.keys(attrs).forEach(function (attr) {
      const node = {
        template: null,
        data: {...attrs, content, style: ''}
      }

      switch (attr) {
        case 'link':
          node.template = options.link
          break
        case 'color':
        case 'bold':
        case 'italic':
        case 'underline':
        case 'strikethrough':
        case 'font':
          node.template = options.styleTags[attr]
          break
        default:
          if (options.attributes) {
            attr = options.attributes[attr]
            if (attr) attr(node, options)
          }
          break
      }

      content = format(node.template, node.data)
    })

    return content
  }

  return format(options.line, {
    line: index + 1,
    content: line.ops.map(contentMap).join('')
  })
}
