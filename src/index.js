import 'normalize.css'

import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'

import configureStore from './configureStore'
import getRouter from './routes'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    {getRouter(store)}
  </Provider>
, document.getElementById('root'))
