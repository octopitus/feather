import React from 'react';
import ReactDOM from 'react-dom';
import Node from './Node';

import styles from './Node.css';

import SelectionManager from 'core/editor/selection';
import eventHandlersMap from 'core/editor/handlers';

export default class NodeListEditor extends React.Component {

  _eventHandlers = null;

  constructor(props) {
    super(props);

    this.state = {
      editorState: props.editorState
    };

    this.onSelect = this._buildHandler('onSelect');
    this.onKeyDown = this._buildHandler('onKeyDown');
    this.onBeforeInput = this._buildHandler('onBeforeInput');
    this.onCut = this._buildHandler('onCut');
    this.onCopy = this._buildHandler('onCopy');
    this.onPaste = this._buildHandler('onPaste');

    this.setMode = this._setMode.bind(this);
  }

  componentDidMount() {
    const editorState = this.state.editorState;

    // Manually focus on editor
    if (editorState.hasFocus()) {
      if (document.activeElement !== this.DOM) {
        this.DOM.focus();
      }

      SelectionManager.setLocationRange(
        this.DOM, editorState.getLocationRange()
      );
    }

    this.setMode('edit');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editorState !== this.props.editorState) {
      this._blockSelectEvent = true;
      this.setState({ editorState: nextProps.editorState });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const nextNodeList = nextState.editorState.getNodesList();
    const nodesList = this.state.editorState.getNodesList();

    if (nextNodeList !== nodesList) {
      return true;
    }

    return false;
  }

  componentWillUpdate() {
    this._blockSelectEvent = true;
  }

  componentDidUpdate() {
    console.log('component updated');
    this._blockSelectEvent = false;
  }

  render() {
    const nodeList = this.state.editorState.getNodesList();
    const header = this.state.editorState.getHeading();

    return (
      <div
        ref={c => this.DOM = c}
        className={styles.documentContent}
        onBeforeInput={this.onBeforeInput}
        onKeyDown={this.onKeyDown}
        onSelect={this.onSelect}
        contentEditable
        suppressContentEditableWarning
        >
        <Node key={0} {...header} asHeader />
        {nodeList.slice(1).toArray().map((node, index) =>
          <Node key={index + 1} {...node} offsetLeft={node.level - header.level} />
        )}
      </div>
    );
  }

  _buildHandler(eventName) {
    return (event) => {
      const method = this._eventHandlers && this._eventHandlers[eventName];
      if (method != null) { // eslint-disable-line eqeqeq
        method.call(this, event);
      }
    };
  }

  _setMode(mode) {
    this._eventHandlers = eventHandlersMap[mode];
  }
}
