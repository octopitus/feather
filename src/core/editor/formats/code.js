import h from 'libs/h.js';

export const defaults = {
  line: '<p data-offset={line}>{content}</p>'
};

export function processLine(line, options, index) {
  return `<p data-offset=${index + 1}>${line.ops.map(op => h(op.insert)).join('')}</p>`;
}
