import React from 'react'

import NodeListEditor from './NodeListEditor'

import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import store from 'core/store'
import editor from 'core/editor'

const EditorState = editor.EditorState
const DataStore = store.DataStore

class NodeList extends React.Component {
  constructor (props) {
    super(props)
    this.onUpdate = this.onUpdate.bind(this)
    this.onLocationChange = this.onLocationChange.bind(this)
    this.debounceFunc = null
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.current && nextProps.current !== this.props.current
  }

  save () {
    console.info('Saving...')
  }

  onLocationChange (updatedLocationRange) {
    if (this.debounceFunc != null) { // eslint-disable-line eqeqeq
      clearTimeout(this.debounceFunc)
      this.debounceFunc = null
      this.save()
    }
  }

  onUpdate (newEditorState) {
    if (this.debounceFunc != null) { // eslint-disable-line eqeqeq
      clearTimeout(this.debounceFunc)
    }

    this.debounceFunc = setTimeout(() => {
      this.save()
    }, 1200)
  }

  componentWillUnmount () {
    clearTimeout(this.debounceFunc)
  }

  render () {
    const { current } = this.props
    const nodesList = DataStore.getNodeList()

    const editorState = EditorState.create({
      nodesList,
      locationRange: current || nodesList.keySeq().first()
    })

    return (
      <NodeListEditor
        editorState={editorState}
        onLocationChange={this.onLocationChange}
        onUpdate={this.onUpdate}
      />
    )
  }
}

export default connect(null, { pushState: push })(NodeList)
