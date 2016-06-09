const TYPES = {
  checkbox: 'checkbox',
  paragraph: 'paragraph',
  code: 'code'
}

export default {
  ...TYPES,
  defaultType: TYPES.checkbox,
  hasChildrenTypes: [TYPES.checkbox],
  blockContentTypes: [TYPES.code, TYPES.paragraph],
  has (type) {
    return !!TYPES[type.toLowerCase()]
  }
}
