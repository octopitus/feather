import { createStore, combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import modules from 'modules'

export default function configureStore () {
  const store = createStore(modules)

  if (module.hot) {
    // Enable Webpack hot module replacement for modules
    module.hot.accept('modules', () => {
      const nextReducer = require('modules').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}
