import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import NodeListEditor from './NodeListEditor'

import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import store from 'core/store'
import editor from 'core/editor'

const EditorState = editor.EditorState;
const DataStore = store.DataStore;

class NodeList extends React.Component {
  constructor(props) {
    super(props)
    this.onUpdate = this.onUpdate.bind(this)
    this.onLocationChange = this.onLocationChange.bind(this)
    this.onNavigate = this.onNavigate.bind(this)
    this.debounceFunc = null
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.current && nextProps.current !== this.props.current
  }

  save() {
    console.info('Saving...')
  }

  onNavigate(nodeKey) {
    if (this.debounceFunc != null) {// eslint-disable-line eqeqeq
      clearTimeout(this.debounceFunc)
      this.debounceFunc = null
      this.save()
    }

    if (!DataStore.keyAllowedForView(nodeKey)) {
      return this.props.pushState(null, '/404')
    }

    return this.props.pushState(null, `/document/${nodeKey}`)
  }

  onLocationChange(updatedLocationRange) {
    if (this.debounceFunc != null) {// eslint-disable-line eqeqeq
      clearTimeout(this.debounceFunc)
      this.debounceFunc = null
      this.save()
    }
  }

  onUpdate(newEditorState) {
    if (this.debounceFunc != null) {// eslint-disable-line eqeqeq
      clearTimeout(this.debounceFunc)
    }

    this.debounceFunc = setTimeout(() => {
      this.save()
    }, 1200)
  }

  render() {
    const { current } = this.props

    // When viewing /document
    // @TODO:60 Try to find a better way
    if (current == null) { // eslint-disable-line eqeqeq
      return (<div />)
    }

    const currentNode = DataStore.get(current)

    const nodesList = [currentNode].concat(
      DataStore.getAllDescendantsOfNode(current).toArray()
    )

    const editorState = EditorState.create({
      nodesList: nodesList,
      locationRange: { index: currentNode.id }
    })

    return (
      <NodeListEditor
        editorState={editorState}
        onLocationChange={this.onLocationChange}
        onUpdate={this.onUpdate}
        onNavigate={this.onNavigate}
      />
    )
  }
}

export default connect(null, { pushState: push })(NodeList)
