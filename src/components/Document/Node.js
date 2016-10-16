import React, { Component, PropTypes } from 'react'

import cx from 'classnames'
import styles from './Node.css'

import formatter from 'core/editor/formats/DocumentFormatter'

export default class Node extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    offset: PropTypes.number,
    completed: PropTypes.bool
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.content !== this.props.content ||
      nextProps.offset !== this.props.offset ||
      nextProps.completed !== this.props.completed ||
      nextProps.type !== this.props.type
    )
  }

  render () {
    const classes = cx({
      [styles.node]: true,
      [styles[this.props.type]]: this.props.type != null, // eslint-disable-line eqeqeq
      [styles.isCompleted]: this.props.completed
    })

    return (
      <div style={{marginLeft: 32 * this.props.offset}} className={styles.nodeContentWrapper}>
        <div className={classes} data-nodeid={this.props.id}>
          <div
            className={styles.nodeContent}
            dangerouslySetInnerHTML={{
              __html: formatter.format(this.props.content).to(this.props.type || 'html')
            }} />
        </div>
      </div>
    )
  }
}
