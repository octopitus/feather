import React from 'react'
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'

import App from 'containers/App'
import Document from 'containers/Document'

export default (store) => {
  const history = syncHistoryWithStore(browserHistory, store)

  return (
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='/document(/:id)' component={Document} />
      </Route>
    </Router>
  )
}
