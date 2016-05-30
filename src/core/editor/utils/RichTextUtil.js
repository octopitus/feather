import Delta from 'rich-text/lib/delta'
import invariant from 'invariant'

class RichTextUtil {
  // Returns length of node's content
  // which is the sum of the lengths of its operations.
  static getLength (param) {
    // Passed an instanceof Delta as parameter
    if (param instanceof Delta) {
      return param.length()
    }

    // Pass array of operation (node's content)
    if (Array.isArray(param)) {
      return (new Delta(param)).length()
    }

    invariant(
      param.content,
      'RichTextUtil#getLength must be invoked with an ' +
      'instance of Delta, a node or its content'
    )

    const delta = new Delta(param.content)
    return delta.length()
  }

  /**
   * Returns Delta which is applied the given operations
   * @param {Object} Must be [insert, delete, retain]
   */
  static build (callback) {
    return callback(new Delta())
  }

  /**
   * Returns new Delta which is concat with others
   */
  static merge (first, ...args) {
    const firstDelta = new Delta(first)
    return args.reduce((result, delta) => {
      result = result.concat(new Delta(delta))
      return result
    }, firstDelta)
  }

  static nodeContentStartWith ({ content } = {}, startWith) {
    const delta = new Delta(content)
    const { ops: deltaStartWith } = delta.slice(0, startWith.length)

    if (!deltaStartWith || deltaStartWith.length === 0) {
      return false
    }

    return startWith === deltaStartWith.map(op => op.insert).join()
  }

  static getCommonAttributes (deltas) {
    const { attributes: commonAttributes } = deltas[0] || {}

    if (deltas.length === 1) {
      return commonAttributes
    }

    for (let { attributes } of deltas.slice(1)) {
      if (!attributes || !Object.keys(attributes).length) return {}
      for (let att in commonAttributes) {
        if (!attributes.hasOwnProperty(att)) {
          commonAttributes[att] = false
        }
      }
    }

    return commonAttributes
  }
}

export default RichTextUtil
