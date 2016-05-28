const Base62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const Base64_CHARS = '-.' + Base62_CHARS

function Base6x (base, charset) {
  if (base !== 64 && base !== 62) throw new Error('base must be 64 or 62')
  if (!charset) {
    if (base === 64) charset = Base64_CHARS
    else if (base === 62) charset = Base62_CHARS
  }

  if (charset.length !== base) throw new Error('charset has invalid length: ' + charset.length)

  var charmap = {}
  charset.split('').forEach(function (c, index) {
    if (charmap[c]) throw new Error('charset must contain unique characters')
    charmap[c] = true

    if (index === 0) return
    if (charset[index - 1] > c) throw new Error('charset must contain ordered characters')
  })

  var Base6x = {}
  Base6x.encode = function (n, padSize) {
    if (typeof n !== 'number' || Number.isNaN(n) || n < 0 || Math.floor(n) !== n) {
      throw new Error('Must be positive integer')
    }
    var s = ''
    if (n === 0) s = charset[0]
    while (n > 0) {
      s = charset[n % base] + s
      n = Math.floor(n / base)
    }
    if (padSize) {
      while (s.length < padSize) s = charset[0] + s
    }
    return s
  }

  Base6x.decode = function (s) {
    var chars = s.split('')
    var v = 0
    chars.forEach(function (c) {
      var index = charset.indexOf(c)
      if (index < 0) throw new Error('Invalid encoded string')
      v = v * base + index
    })
    return v
  }

  return Base6x
}

module.exports = Base6x
