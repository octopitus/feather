/* eslint-disable new-cap */
import { Record } from 'immutable';
import invariant from 'invariant';
import Delta from 'rich-text/lib/delta';

import encoder from 'core/encoding';
import store from 'core/store';

import NodeType from './NodeType';

function generateNodeKey() {
  return encoder.genNodeId(store.getUser());
}

const defaultNodeRecord = {
  id: null,
  before: null,
  after: null,
  level: 1,
  content: [{insert: ''}],
  type: NodeType.defaultType,
  show: true
};

class Node extends Record(defaultNodeRecord) {
  static create(args = {}) {
    return new Node({
      ...args,
      id: generateNodeKey()
    });
  }

  /**
   * Slice content of node from start to end
   * Returns node with new content
   */
  static slice(start = 0, end, node) {
    // Method can be call with args: start, node
    if (node == null) { // eslint-disable-line eqeqeq
      node = end;
      end = undefined;
    }

    node = new Node(node);

    const { ops } = node.getAsDelta().slice(start, end);
    return node.set('content', ops);
  }

  getContent() {
    return this.get('content');
  }

  getAsDelta() {
    return new Delta(this.getContent());
  }

  compose(composeWith) {
    invariant(
      composeWith instanceof Delta,
      'Node#compose must be invoked with an instance of Delta'
    );

    const { ops } = this.getAsDelta().compose(composeWith);
    return this.set('content', ops);
  }
}

export default Node;
