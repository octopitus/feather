import { createStore } from 'redux'

import reducers from 'redux/reducers'

function configureStore () {
  const store = createStore(reducers)

  if (module.hot) {
    // Enable Webpack hot module replacement for modules
    module.hot.accept('redux/reducers', () => {
      const nextReducer = require('redux/reducers').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export default configureStore
