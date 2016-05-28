import UTF16String from './Utf16String'

const ZERO_WIDTH_SPACE = '\uFEFF'
const NON_BREAKING_SPACE = '\u00A0'
const OBJECT_REPLACEMENT_CHARACTER = '\uFFFC'

function utf16StringDifference (a, b) {
  let leftIndex = 0, rightIndexA = a.length, rightIndexB = b.length
  while (leftIndex < rightIndexA && a.charAt(leftIndex).isEqualTo(b.charAt(leftIndex))) {
    leftIndex++
  }
  while (rightIndexA > leftIndex + 1 && a.charAt(rightIndexA - 1).isEqualTo(b.charAt(rightIndexB - 1))) {
    rightIndexA--
    rightIndexB--
  }
  return {
    utf16String: a.slice(leftIndex, rightIndexA),
    offset: leftIndex
  }
}

function utf16StringDifferences (a, b) {
  let codepoints, diffA, diffB, length, offset
  if (a.isEqualTo(b)) { return ['', ''] }
  diffA = utf16StringDifference(a, b)
  length = diffA.utf16String.length
  diffB = length ? ((offset = diffA.offset, diffA), codepoints = a.codepoints.slice(0, offset).concat(a.codepoints.slice(offset + length)), utf16StringDifference(b, UTF16String.fromCodepoints(codepoints))) : utf16StringDifference(b, a)
  return [diffA.utf16String.toString(), diffB.utf16String.toString()]
}

export function normalizeSpaces (string) {
  return string.replace(RegExp('' + ZERO_WIDTH_SPACE, 'g'), '').replace(RegExp('' + NON_BREAKING_SPACE, 'g'), ' ')
}

export function summarizeStringChange (oldString, newString) {
  oldString = UTF16String.box(oldString)
  newString = UTF16String.box(newString)
  if (newString.length < oldString.length) {
    const [removed, added] = utf16StringDifferences(oldString, newString)
    return { removed, added }
  }
  const [added, removed] = utf16StringDifferences(newString, oldString)
  return { removed, added }
}
