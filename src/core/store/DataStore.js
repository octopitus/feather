/* eslint-disable new-cap */
import { OrderedMap } from 'immutable'
import invariant from 'invariant'

import Node from './Node'
import NodeType from './NodeType'

const defaultDataStoreRecord = {
  nodeList: null
}

class DataStore {

  nodeList = null;

  createFromArray (list) {
    const keysReference = list.reduce((result, node) => {
      result[node.before] = Object.assign({}, node)
      return result
    }, {})

    const result = [keysReference[null]]

    for (let i = 1; i < list.length; i++) {
      result[i] = keysReference[result[i - 1].id]
    }

    this.setNodeList(
      OrderedMap(
        result.map(node => [node.id, node])
      )
    )
  }

  setNodeList (nodeList) {
    invariant(
      nodeList instanceof OrderedMap,
      'DataStore#setNodeList must be invoked with an instance of Immutable#OrderedMap.'
    )

    this.nodeList = nodeList
  }

  getNodeList () {
    return this.nodeList
  }

  get (key) {
    invariant(
      key && this.getNodeList().has(key),
      `${key} was not found. Seems like DataStore#get was invoked with an ojbect?`
    )

    return this.getNodeList().get(key)
  }

  getAllDescendantsOfNode (key) {
    const node = this.get(key)

    return this.getNodeList()
      .skipUntil((_, k) => k === key).skip(1)
      .takeUntil(v => v.level <= node.level)
  }

  getParentKeyOfNode (key) {
    const nodeForKey = this.get(key)

    let traversalNode = nodeForKey
    while (traversalNode.before) {
      const maybeParentNode = this.get(traversalNode.before)

      if (maybeParentNode.level < nodeForKey.level) {
        return maybeParentNode.id
      }

      traversalNode = maybeParentNode
    }
  }
}

export default new DataStore()
