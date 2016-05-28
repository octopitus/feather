import React from 'react'
import Document from './Document'
import styles from './App.css'

export default class App extends React.Component {
  render () {
    return (
      <div className={styles.app}>
        { this.props.children }
      </div>
    )
  }
}
