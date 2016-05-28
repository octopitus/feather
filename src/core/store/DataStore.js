/* eslint-disable new-cap */
import { OrderedMap } from 'immutable';
import invariant from 'invariant';

import Node from './Node';
import NodeType from './NodeType';

const defaultDataStoreRecord = {
  nodeList: null
};

class DataStore {

  nodeList = null;

  eventHandlers = {};

  on(eventName, callback) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
    this.eventHandlers[eventName].push(callback);
    return () => {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(handler => {
        return handler !== callback;
      });
    };
  }

  emit(eventName, ...data) {
    if (!this.eventHandlers[eventName]) return;
    for (let callback of this.eventHandlers[eventName]) {
      callback.call(null, ...data);
    }
  }

  createFromArray(list) {
    const keysReference = list.reduce((result, node) => {
      result[node.before] = Object.assign({}, node);
      return result;
    }, {});

    const result = [keysReference[null]];

    for (let i = 1; i < list.length; i++) {
      result[i] = keysReference[result[i - 1].id];
    }

    this.setNodeList(
      OrderedMap(
        result.map(node => [node.id, node])
      )
    );
  }

  setNodeList(nodeList) {
    invariant(
      nodeList instanceof OrderedMap,
      'DataStore#setNodeList must be invoked with an instance of Immutable#OrderedMap.'
    );

    this.nodeList = nodeList;
  }

  /**
   * Diff old & new state of editor and patching store with it
   */
  replaceWith(oldEditorState, newEditorState) {
    //
  }

  getNodeList() {
    return this.nodeList;
  }

  keyAllowedForView(key) {
    const node = this.getNodeList().get(key);
    return !!node && NodeType.blockContentTypes.indexOf(node.type) === -1;
  }

  get(key, shouldCached = true) {
    invariant(
      key && this.getNodeList().has(key),
      `${key} was not found. Seems like DataStore#get was invoked with an ojbect?`
    );

    return this.getNodeList().get(key);
  }

  getAllDescendantsOfNode(key) {
    const node = this.get(key);

    return this.getNodeList()
      .skipUntil((_, k) => k === key).skip(1)
      .takeUntil(v => v.level <= node.level);
  }

  getParentKeyOfNode(key) {
    const nodeForKey = this.get(key);

    let isConsideringNode = nodeForKey;
    while (isConsideringNode.before) {
      const maybeParentNode = this.get(isConsideringNode.before);

      if (maybeParentNode.level < nodeForKey.level) {
        return maybeParentNode.id;
      }

      isConsideringNode = maybeParentNode;
    }
  }
}

export default new DataStore();
