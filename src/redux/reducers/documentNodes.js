const DOCUMENT_CHANGED = 'document/CHANGED'

const initialState = {
  loaded: false
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case DOCUMENT_CHANGED: {
      return {
        ...state,
        loaded: true
      }
    }
    default:
      return state
  }
}

export function documentChanges () {
  return {
    type: DOCUMENT_CHANGED
  }
}
