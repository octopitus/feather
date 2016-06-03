import React from 'react'
import ReactDOM from 'react-dom'
import Node from './Node'

import styles from './Node.css'

import SelectionManager from 'core/editor/selection'
import eventHandlersMap from 'core/editor/handlers'

export default class NodesListEditor extends React.Component {

  _eventHandlers = null;

  constructor (props) {
    super(props)

    this.state = {
      editorKey: 1,
      editorState: props.editorState
    }

    this._clipboardData = null;
    this._guardAgainstRender = false;

    this.onSelect = this._buildHandler('onSelect')
    this.onKeyDown = this._buildHandler('onKeyDown')
    this.onKeyUp = this._buildHandler('onKeyUp')
    this.onBeforeInput = this._buildHandler('onBeforeInput')
    this.onCut = this._buildHandler('onCut')
    this.onCopy = this._buildHandler('onCopy')
    this.onPaste = this._buildHandler('onPaste')

    this.setMode = this._setMode.bind(this)

    this.setClipboard = this._setClipboard.bind(this)
    this.getClipboard = this._getClipboard.bind(this)

    this.removeRenderGuard = this._removeRenderGuard.bind(this)
    this.setRenderGuard = this._setRenderGuard.bind(this)

    this.restoreEditorDOM = this._restoreEditorDOM.bind(this)
  }

  componentDidMount () {
    const editorState = this.state.editorState

    // Manually focus on editor
    if (editorState.hasFocus()) {
      if (document.activeElement !== this.DOM) {
        this.DOM.focus()
      }

      SelectionManager.setLocationRange(
        this.DOM, editorState.getLocationRange()
      )
    }

    this.setMode('edit')
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.editorState !== this.props.editorState) {
      this.setState({ editorState: nextProps.editorState })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const nextNodesList = nextState.editorState.getNodesList()
    const nodesList = this.state.editorState.getNodesList()

    if (nextNodesList !== nodesList) {
      return true
    }

    console.log('no update lol');

    return false
  }

  componentWillUpdate (nextProps, nextState) {
    this._blockSelectEvent = true
  }

  componentDidUpdate () {
    this._blockSelectEvent = false
  }

  render () {
    const nodesList = this.state.editorState.getNodesList()
    const header = this.state.editorState.getHeading()

    let traversalNode = header.after
    const nodesChildren = []

    for (let i = 1; i < nodesList.size; i++) {
      const node = nodesList.get(traversalNode)

      nodesChildren[i] = (
        <Node
          key={node.id}
          id={node.id}
          type={node.type}
          content={node.content}
          offset={node.level - header.level}
        />
      )

      traversalNode = node.after
    }

    return (
      <div
        key={'editor-' + this.state.editorKey}
        ref={c => this.DOM = c}
        className={styles.documentContent}
        onBeforeInput={this.onBeforeInput}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onSelect={this.onSelect}
        onCopy={this.onCopy}
        onCut={this.onCut}
        onPaste={this.onPaste}
        contentEditable
        suppressContentEditableWarning
        >
        <Node key={header.id} id={header.id} content={header.content} type={header.type} asHeader />
        {nodesChildren}
      </div>
    )
  }

  _buildHandler (eventName) {
    return (event) => {
      const method = this._eventHandlers && this._eventHandlers[eventName]
      if (method != null) { // eslint-disable-line eqeqeq
        method.call(this, event)
      }
    }
  }

  _setMode (mode) {
    this._eventHandlers = eventHandlersMap[mode]
  }

  _setClipboard (data) {
    if (__DEVELOPMENT__) {
      console.log('Clipboard data', data);
    }

    this._clipboardData = data
  }

  _getClipboard() {
    return this._clipboardData
  }

  _setRenderGuard() {
    this._guardAgainstRender = true
  }

  _removeRenderGuard() {
    this._guardAgainstRender = false
  }

  _restoreEditorDOM({x, y} = {}) {
    this.setState({editorKey: this.state.editorKey +1}, () => {

    });
  }
}
