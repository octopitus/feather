import { defaults, processLine } from './html'
import { defaults as codeDefaults, processLine as codeProcessLine } from './code'
import { defaults as plainTextDefaults, processLine as plainTextProcessLine } from './code'

export default class DocumentFormatter {

  static formats = {};

  static defineFormat (type, name, options, formatFunc) {
    DocumentFormatter.formats[name] = {
      type: type,
      func: formatFunc,
      defaults: options
    }
  }

  static hasFormat (name) {
    return DocumentFormatter.formats.hasOwnProperty(name)
  }

  static format (delta) {
    return new DocumentFormatter(delta)
  }

  constructor (delta) {
    this.delta = this.serialize(Array.isArray(delta) ? delta : delta.ops)
  }

  to (format, options = {}) {
    if (!DocumentFormatter.hasFormat(format)) {
      throw new Error('Unknown conversion format "' + format + '"')
    }

    format = DocumentFormatter.formats[format]
    options = Object.assign(options, format.defaults)

    return this.delta.map((line, index) => format.func(line, options, index)).join('')
  }

  serialize (delta) {
    const ops = delta.slice()
    let op, line, chunks
    let lines = []

    newline()

    for (let i = 0; i < ops.length; i++) {
      op = ops[i]
      if (!op.insert) {
        continue
      } else if (op.insert === '\n') {
        // This is an EOL marker
        line.attributes = op.attributes
        newline()
      } else if (typeof op.insert === 'number') {
        // If this op is an embed, it belongs on its own line
        // Create a new line for this if we're currently in the middle of line
        if (line.ops.length) newline()
        line.ops.push(op)
        newline()
      } else if (op.insert.indexOf('\n') >= 0) {
        // If this op contains a newline, we will need to break it up
        chunks = op.insert.split('\n')
        chunks.forEach(chunkToOp)
      } else {
      // Otherwise, this is just an inline chunk
        line.ops.push(op)
      }
    }

    function newline () {
      line = {ops: [ ], attributes: { }}
      lines.push(line)
    }

    function chunkToOp (chunk, index) {
      line.ops.push({
        insert: chunk, attributes: op.attributes
      })
      if (!isLastChunk(index)) newline()
    }

    function isLastChunk (index) {
      return ((chunks.length - 1) === index)
    }

    return lines
  }
}

DocumentFormatter.defineFormat('line', 'html', defaults, processLine)
DocumentFormatter.defineFormat('line', 'bullet', defaults, processLine)
DocumentFormatter.defineFormat('line', 'paragraph', defaults, processLine)

DocumentFormatter.defineFormat('line', 'code', codeDefaults, codeProcessLine)

DocumentFormatter.defineFormat('line', 'plaintext', plainTextDefaults, plainTextProcessLine)
