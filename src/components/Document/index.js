import React from 'react'
import NodeList from './NodeList'

import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { documentChanges } from 'modules/documentNodes'

import cx from 'classnames'
import styles from './Node.css'

import store from 'core/store'

const DataStore = store.DataStore
const TransportLayer = store.TransportLayer

class DocumentWrapper extends React.Component {

  componentDidMount () {
    const { documentLoaded } = this.props

    /**
     * Loading all documents of user of given id
     * Should return raw data from server
     */
    if (!documentLoaded) {
      TransportLayer.boostrap().then(nodeList => {
        DataStore.createFromArray(nodeList)
        // @TODO: Handle show ancestors of current node in sidebar when initialization
        this.props.documentChanges()
      })

      // @TODO: Handle load bookmarks somewhere instead of current appoarch
      // return this.props.loadBookmark(user)
    }
  }

  render () {
    if (!this.props.documentLoaded) {
      // @TODO:50 Loading message
      return (<span>Loading</span>)
    }

    if (this.props.error) {
      // @TODO:50 Show error message
      return (<span>Error</span>)
    }

    const classes = cx(styles.row, styles.wrapper)

    return (
      <div className={classes}>
        <NodeList current={this.props.current} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    documentLoaded: state.documentNodes.loaded
  }
}

export default connect(mapStateToProps, { documentChanges, pushState: push })(DocumentWrapper)
