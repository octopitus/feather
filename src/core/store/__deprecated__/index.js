import LinkedNodeList, { EVENT } from 'core/editor/__deprecated__/LinkedNodeList'
import * as treeHelper from 'utils/treeHelper'

import { OrderedMap } from 'immutable'
import testCase from 'core/store/__test__/testCase'

import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-upsert'))

// @TODO: WIP sort function
function sort (list) {
  const keysReference = list.reduce((result, node) => {
    result[node.before] = Object.assign({}, node)
    return result
  }, {})

  const result = [keysReference[null]]

  for (let i = 1; i < list.length; i++) {
    result[i] = keysReference[result[i - 1].id]
  }

  return result
}

// @TODO:10 Bouncing pouchdb
class DataStore {

  document = null;

  localDB = null;

  remoteDB = null;

  sync = null;

  eventHandlers = {};

  constructor () {
    this.document = new LinkedNodeList()
    this.document.delegate = this
    this.recentChanges = []
  }

  get current () {
    return this.document.findNode(
      this.document.currentViewing
    )
  }

  boostrap () {
    this.localDB = new PouchDB('liti-book')
    this.remoteDB = new PouchDB(window.location.origin + '/api/db/')
    return Promise.all([this.localDB, this.remoteDB]).then(this.enableSync.bind(this))
  }

  enableSync () {
    this.sync = this.localDB.sync(this.remoteDB, {
      live: true
    }).on('change', replication => {
      console.log(replication)
      if (replication.direction === 'push') {
        const deletedDocs = replication.change.docs.filter(doc => doc._deleted).map(doc => doc._id)
        if (deletedDocs.length) {
          this.emit('deleteNode', deletedDocs) // Fire event deleteNode
        }
      }
    }).on('error', e => {
      // TODO
      console.error(e)
    })
  }

  dispose () {
    localStorage.clear()
    return Promise.all([
      this.sync.cancel(), this.localDB.destroy()
    ])
  }

  on (eventName, callback) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName] || []
    this.eventHandlers[eventName].push(callback)
    return () => {
      this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(handler => {
        return handler !== callback
      })
    }
  }

  emit (eventName, ...data) {
    if (!this.eventHandlers[eventName]) return
    for (let callback of this.eventHandlers[eventName]) {
      callback.call(null, ...data)
    }
  }

  loadFromUser (userId) {
    // For development purpose
    if (__DEVELOPMENT__) {
      return Promise.resolve(
        OrderedMap( // eslint-disable-line new-cap
          sort(testCase).map(node => [node.id, node])
        )
      )
    }

    const hasLocal = localStorage.getItem(userId) ? 'local' : 'remote'

    return this[`${hasLocal}DB`].allDocs({include_docs: true}).then((result) => {

      console.info('Found', result.total_rows, 'row(s) in', hasLocal)

      if (!result.total_rows) {
        // If user has more than one document
      } else {
        //
      }

      return Promise.resolve(/* Whatever */)
    })
  }

  getAllDocs (filterFunc = (node) => true) {
    const nodes = []
    this.document.traversal(this.document.root, (child) => {
      if (filterFunc(child)) nodes.push(child)
    })
    return nodes
  }

  getDocById (id, { asArray = false } = {}) {
    const node = this.document.findNode(id)
    return !asArray ? node : treeHelper.flatten(
      node,
      ['children', 'sidebarExpaned']
    )
  }

  createBullet (content = [{insert: ''}], { parentNode = this.document.rootNode, type = 'bullet', order = 0 } = {}) {
    return this.document.addTextNode(content, { type, content, parentNode, order })
  }

  createDoc (content = [{insert: ''}], { parentNode = this.document.rootNode, type = 'doc', order = 0 } = {}) {
    return this.document.addTextNode(content, { type, content, parentNode, order })
  }

  createSection (content = [{insert: ''}], { parentNode = this.document.rootNode, order = 0 } = {}) {
    const parent = this.document.findNode(parentNode)
    if (parent.type !== 'doc') throw new Error(`Parent node ${parentNode} must have type "document"`)
    return this.document.addTextNode(content, { type: 'section', content, parentNode, order })
  }

  remove (id) {
    return this.document.remove(id)
  }

  documentDidChange (changes) {
    this.recentChanges = this.recentChanges.concat(changes)
  }

  requestSave ({ skipEmit = false } = {}) {
    if (!this.document.userId) throw new Error('Unauthenticated')
    let undoEntries = []
    this.recentChanges.reduceRight((result, change, index) => {
      if (!result[change._id]) {
        result[change._id] = true
        undoEntries.push(change)
      }
      return result
    }, {})
    undoEntries = undoEntries.map((entry) => {
      if (!this.document.has(entry._id)) {
        return this.localDB.upsert(entry._id, (doc) => {
          return { _id: entry._id, _deleted: true }
        })
      }
      let node = null
      try {
        node = this.document.findNode(entry._id)
      } catch (e) {
        node = { _id: entry._id, _deleted: true }
      }
      return this.localDB.upsert(entry._id, (doc) => {
        return treeHelper.withoutProps(
          node,
          ['children', 'sidebarExpaned']
        )
      })
    })
    return Promise.all(undoEntries).then((docs) => {
      if (!skipEmit) this.emit('saved')
      this.clearRecentChanges()
    })
  }

  clearRecentChanges () {
    console.info('Successfully saved all changes.')
    this.recentChanges = []
  }

  toJSON () {
    return this.document.root
  }

  toArray () {
    return treeHelper.flatten(this.toJSON(), ['sidebarExpaned', 'children'])
  }
}

export default new DataStore()
