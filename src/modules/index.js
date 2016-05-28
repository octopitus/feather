import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import documentNodes from './documentNodes'

export default combineReducers({
  routing: routerReducer,
  documentNodes,
})
