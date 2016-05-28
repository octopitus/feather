function ucs2encode(array) {
  return String.fromCodePoint.apply(String, array);
}

function ucs2decode(string) {
  return Array.from(string).map((char) => char.codePointAt(0));
}

export default class UTF16String {

  constructor(ucs2String, codepoints) {
    this.ucs2String = ucs2String;
    this.codepoints = codepoints;
    this.length = this.codepoints.length;
    this.ucs2Length = this.ucs2String.length;
  }

  static box(value = '') {
    if (value instanceof UTF16String) {
      return value;
    }
    return UTF16String.fromUCS2String(value);
  }

  static fromUCS2String(ucs2String) {
    return new UTF16String(ucs2String, ucs2decode(ucs2String));
  }

  static fromCodepoints(codepoints) {
    return new UTF16String(ucs2encode(codepoints), codepoints);
  }

  offsetToUCS2Offset(offset) {
    return ucs2encode(this.codepoints.slice(0, Math.max(0, offset))).length;
  }

  offsetFromUCS2Offset(ucs2Offset) {
    return ucs2decode(this.ucs2String.slice(0, Math.max(0, ucs2Offset))).length;
  }

  slice(fromIndex, toIndex) {
    const ref = this.codepoints.slice(fromIndex, toIndex);
    return UTF16String.fromCodepoints(ref);
  }

  charAt(offset) {
    return this.slice(offset, offset + 1);
  }

  isEqualTo(value) {
    return UTF16String.box(value).ucs2String === this.ucs2String;
  }

  toJSON() {
    return this.ucs2String;
  }

  getCacheKey() {
    return this.ucs2String;
  }

  toString() {
    return this.ucs2String;
  }
}
