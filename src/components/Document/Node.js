import React, { Component, PropTypes } from 'react'

import cx from 'classnames'
import styles from './Node.css'

import formatter from 'core/editor/formats/DocumentFormatter'

export default class Node extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    offset: PropTypes.number
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.content !== this.props.content ||
      nextProps.offset !== this.props.offset ||
      nextProps.type !== this.props.type
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (__DEVELOPMENT__) {
      console.log('Updated', this.props.id);
    }
  }

  renderAsHeader () {
    if (!this.props.content) return null
    return (
      <h3
        data-nodeid={this.props.id}
        className={styles.header}
        dangerouslySetInnerHTML={{__html: formatter.format(this.props.content).to('html')}}
      />
    )
  }

  render () {
    if (this.props.asHeader) {
      return this.renderAsHeader()
    }

    const classes = cx({
      [styles.node]: true,
      [styles[this.props.type]]: this.props.type != null // eslint-disable-line eqeqeq
    })

    return (
      <div className={classes} data-nodeid={this.props.id}>
        <div
          style={{marginLeft: 32 * this.props.offset}}
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: formatter.format(this.props.content).to(this.props.type || 'html')
          }} />
      </div>
    )
  }
}
