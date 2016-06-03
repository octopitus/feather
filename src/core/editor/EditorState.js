/* eslint-disable new-cap */
import { Stack, Record, OrderedMap } from 'immutable'
import invariant from 'invariant'

import SelectionManager from 'core/editor/selection'
import store from 'core/store'

const DataStore = store.DataStore
const Node = store.Node

const defaultEditorRecord = {
  undo: Stack(),
  nodesList: null,
  rangeStart: null,
  rangeEnd: null
}

class EditorState extends Record(defaultEditorRecord) {

  static create ({ nodesList, locationRange }) {
    const { start, end } = SelectionManager.normalizeRange(locationRange)

    if (!(nodesList instanceof OrderedMap)) {
      nodesList = OrderedMap(
        nodesList.map((node) => [node.id, node])
      )
    }

    return new EditorState({
      nodesList: nodesList,
      rangeStart: start,
      rangeEnd: end
    })
  }

  static update (editorState, editorRecords = {}) {
    invariant(
      editorState instanceof EditorState,
      'EditorState#update must be invoked with 1st param is an instanceof of EditorState'
    )

    const newState = editorState.withMutations((state) => {
      if (
        'locationRange' in editorRecords &&
        !SelectionManager.rangesAreEqual(
          editorState.getLocationRange(),
          editorRecords.locationRange
        )
      ) {
        const { start, end } = SelectionManager.normalizeRange(
          editorRecords.locationRange
        )

        state.set('rangeStart', start)
        state.set('rangeEnd', end)
      }

      // nodesList is immutable
      // so we just need check if two of them are equal
      if (
        'nodesList' in editorRecords &&
        editorRecords.nodesList !== editorState.getNodesList()
      ) {
        let newNodesList = editorRecords.nodesList
        if (!(newNodesList instanceof OrderedMap)) {
          newNodesList = OrderedMap(newNodesList)
        }

        state.set('nodesList', newNodesList)
      }
    })

    return newState
  }

  getLocationRange () {
    const start = this.getRangeStart()
    const end = this.getRangeEnd()
    return { start, end }
  }

  getNodesList () {
    return this.get('nodesList')
  }

  getRangeStart () {
    return this.get('rangeStart')
  }

  getRangeEnd () {
    return this.get('rangeEnd')
  }

  getHeading () {
    return this.getNodesList().first()
  }

  getLast () {
    return this.getNodesList().last()
  }

  getNodeForKey (key) {
    return this.getNodesList().get(key)
  }

  getNodesInRange (startRange, endRange) {
    const nodesList = this.getNodesList()

    invariant(
      nodesList.has(startRange) && nodesList.has(endRange),
      `${startRange} -> ${endRange} is not in current nodes list.`
    )

    const nodeAtRangeStart = nodesList.get(startRange)
    const nodes = [nodeAtRangeStart]

    let isTravellingNode = nodeAtRangeStart
    while (isTravellingNode.id !== endRange) {
      const nextNode = nodesList.get(isTravellingNode.after)
      nodes[nodes.length] = nextNode
      isTravellingNode = nextNode
    }

    return nodes
  }

  extractContentsInLocationRange () {
    const { start, end } = this.getLocationRange()
    const nodesInLocationRange = this.getNodesInRange(start.index, end.index)

    // Content of the first node
    const { content: startContent } = Node.slice(
      start.offset, nodesInLocationRange[0]
    )

    // Content of the last node
    const { content: endContent } = Node.slice(
      0, end.offset, nodesInLocationRange[nodesInLocationRange.length - 1]
    )

    // Content of node between the start & end
    const contentOfNodes = nodesInLocationRange.slice(1, -1).reduce((result, node) => {
      result = result.concat(node.content)
      return result
    }, [])

    return Array.prototype.concat.call([],
      startContent, contentOfNodes, endContent
    )
  }

  hasFocus () {
    return SelectionManager.isValidRange(
      this.getLocationRange()
    )
  }
}

export default EditorState
