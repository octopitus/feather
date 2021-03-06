import React from 'react'
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

    this._guardAgainstRender = false

    this.onSelect = this._buildHandler('onSelect')
    this.onKeyDown = this._buildHandler('onKeyDown')
    this.onKeyUp = this._buildHandler('onKeyUp')
    this.onBeforeInput = this._buildHandler('onBeforeInput')
    this.onCut = this._buildHandler('onCut')
    this.onCopy = this._buildHandler('onCopy')
    this.onPaste = this._buildHandler('onPaste')

    this.onClick = this._buildHandler('onClick', 'click')

    this.setMode = this._setMode.bind(this)
    this.setDefaultMode = this._setMode.bind(this, 'edit')

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

    this.setDefaultMode()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.editorState !== this.props.editorState) {
      this.setState({ editorState: nextProps.editorState })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const nextNodesList = nextState.editorState.getNodesList()
    const nodesList = this.state.editorState.getNodesList()

    return nextNodesList !== nodesList
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

    const nodesChildren = []

    nodesChildren.push(
      <Node
        key={header.id}
        id={header.id}
        type={header.type}
        content={header.content}
        completed={header.completed}
        offset={header.level - header.level}
      />
    )

    let traversalNode = header.after

    while (traversalNode !== null) {
      const node = nodesList.get(traversalNode)

      nodesChildren.push(
        <Node
          key={node.id}
          id={node.id}
          type={node.type}
          content={node.content}
          completed={node.completed}
          offset={node.level - header.level}
        />
      )

      traversalNode = node.after
    }

    return (
      <div
        key={'editor-' + this.state.editorKey}
        ref={c => { this.DOM = c }}
        className={styles.documentContent}
        onBeforeInput={this.onBeforeInput}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onSelect={this.onSelect}
        onCopy={this.onCopy}
        onCut={this.onCut}
        onPaste={this.onPaste}
        onClick={this.onClick}
        contentEditable
        suppressContentEditableWarning
        >
        {nodesChildren}
      </div>
    )
  }

  _buildHandler (eventName, eventHandlerKey) {
    return (event) => {
      if (eventHandlerKey) {
        this.setMode(eventHandlerKey)
        setTimeout(() => this.setDefaultMode(), 0)
      }

      const method = this._eventHandlers && this._eventHandlers[eventName]

      if (method != null) { // eslint-disable-line eqeqeq
        method.call(this, event)
      }
    }
  }

  _setMode (mode) {
    this._eventHandlers = eventHandlersMap[mode]
  }

  _setRenderGuard () {
    this._guardAgainstRender = true
  }

  _removeRenderGuard () {
    this._guardAgainstRender = false
  }

  _restoreEditorDOM ({x, y} = {}) {
    this.setState({editorKey: this.state.editorKey + 1})
  }
}
