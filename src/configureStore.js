import { createStore, combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import reducers from 'redux/reducers'

function configureStore () {
  const store = createStore(reducers)

  if (module.hot) {
    // Enable Webpack hot module replacement for modules
    module.hot.accept('modules', () => {
      const nextReducer = require('modules').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export default configureStore
