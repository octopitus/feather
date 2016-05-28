const TYPES = {
  bullet: 'bullet',
  paragraph: 'paragraph',
  code: 'code',
  checklist: 'checklist',
}

export default {
  defaultType: TYPES.bullet,
  hasChildrenTypes: [TYPES.bullet, TYPES.checklist],
  blockContentTypes: [TYPES.code, TYPES.paragraph],
  has (type) {
    return !!TYPES[type.toLowerCase()]
  },
}
