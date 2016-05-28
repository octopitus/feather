import TransportLayer from './PouchDBTransportLayer'
import DataStore from './DataStore'
import NodeType from './NodeType'
import Node from './Node'

const globalConfigs = {
  userId: null
}

export default {
  Node,
  NodeType,
  DataStore,
  TransportLayer,
  getUserId () {
    if (__DEVELOPMENT__) return '2peyV6'
    throw new Error('Should be called in development mode')
  }
}
