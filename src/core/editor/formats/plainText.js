export const defaults = {
  line: '<p data-offset={line}>{content}</p>'
}

export function processLine (line, options, index) {
  return `<p data-offset=${(index + 1)}>${line.ops.map(op => op.insert).join('')}</p>`
}
