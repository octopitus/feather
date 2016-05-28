import { withoutProps, flatten } from 'utils/treeHelper';

let encoder = null;

if (__CLIENT__) {
  encoder = require('core/encoding');
}

export function random_base62(userId) {
  return encoder.genNodeId(userId);
}

export const EVENT = {
  ADD: 'node_added',
  MOVE: 'node_moved',
  REMOVE: 'node_removed',
  UPDATE: 'node_updated',
  REF: 'reference_changed'
};

export default class LinkedNodeList {

  delegate = null;

  constructor() {
    this.userId = null;
    /* Holding reference to each node */
    this.map = new Map();
    /* Holding order of entity nodelist */
    this.rootNode = null;
    /* Current node being view */
    this.currentViewing = null;
  }

  createRoot(id = random_base62(this.userId)) {
    this.rootNode = id;
    this.map.set(this.rootNode, { id: this.rootNode, children: [] });
  }

  get size() {
    return this.map.size - 1;
  }

  get root() {
    return this.findNode(this.rootNode);
  }

  set root(treeObject) {
    this.map.clear();

    let rootId = treeObject._id;
    if (!rootId) {
      let [firstChild] = treeObject.children;
      rootId = firstChild.parent_id;
    }

    this.createRoot(rootId);
    this.buildMap(treeObject);
  }

  buildMap(tree) {
    for (let i = 0, len = tree.children.length; i < len; i++) {
      const node = tree.children[i];
      this.add(node, { parentNode: node.parent_id, order: i });
      if (node.children && node.children.length) {
        this.buildMap(node);
      }
    }
  }

  // PouchDB docs
  fromArray(documents) {
    if (!documents[0]['doc'] || !documents[0]['doc']['ancestors']) {
      throw new Error('Root node not found', documents[0]);
    }
    const [rootNode] = documents[0]['doc']['ancestors'];
    this.createRoot(rootNode);
    for (let { doc } of documents) {
      this.map.set(doc._id, { ...doc, children: [] });
    }
    for (const [_id, node] of this.map) {
      if (this.map.has(node.parent_id)) {
        const parent = this.map.get(node.parent_id);
        parent.children.push(node);
      } else {
        if (node._id && node._id !== this.rootNode) {
          console.warn(`Node ${node._id} does not have parent. It therefore will be added to root.`);
          this.add(node, {
            forceUpdate: true,
            parentNode: this.rootNode,
            order: -1
          });
        }
      }
    }
    for (const [_id, node] of this.map) {
      node.children = node.children.sort((a, b) => a.order - b.order);
    }
  }

  fromJSON(treeObject) {
    this.root = treeObject;
  }

  has(_id) {
    return this.map.has(_id);
  }

  add(node, { parentNode = this.rootNode, order = 0, forceUpdate = false } = {}) {
    const parent = this.findNode(parentNode);
    const newNode = {
      _id: node._id || random_base62(this.userId),
      type: node.type || 'bullet',
      ancestors: (parent.ancestors || []).concat(parentNode),
      parent_id: parentNode,
      content: node.content && node.content.length ? node.content : [{insert: ''}],
      order: order > -1 ? order + 1 : parent.children.length,
      children: []
    };

    if (this.map.has(newNode._id) && !forceUpdate) {
      Promise.reject(`Node ${newNode._id} is existed in tree. Consider using update() instead.`);
    }

    if (!parent.children || !parent.children.length) {
      parent.children = [newNode];
    } else if (order === -1) {
      parent.children.push(newNode);
    } else {
      parent.children.splice(order, 0, newNode);
    }

    this.map.set(newNode._id, newNode);
    setTimeout(() => this.calculateOrderOfBranch(parent.children));

    return Promise.resolve(newNode);
  }

  addTextNode(content = [], { type, parentNode, order } = {}) {
    return this.add({ content, type }, { parentNode, order }).then(newNode => {
      this.delegate.documentDidChange({ context: EVENT.ADD, _id: newNode._id });
      return newNode;
    });
  }

  remove(id) {
    const node = this.findNode(id);
    const parent = this.findNode(node.parent_id);
    let removedNodes = [];

    this.traversal(node, (n) => {
      removedNodes.push(n._id);
      this.map.delete(n._id);
    });

    parent.children.splice(node.order - 1, 1);
    setTimeout(() => this.calculateOrderOfBranch(parent.children));

    if (removedNodes.length) {
      this.delegate.documentDidChange(removedNodes.map(_id => {
        return {context: EVENT.REMOVE, _id};
      }));
    }

    return Promise.resolve(removedNodes);
  }

  update(nodeId, properties = {}) {
    const node = this.findNode(nodeId);
    const oldValues = {};
    for (let attr in properties) {
      if (Object.hasOwnProperty.call(node, attr)) {
        oldValues[attr] = node[attr];
      }
      node[attr] = properties[attr];
    }
    this.delegate.documentDidChange({context: EVENT.UPDATE, _id: nodeId});
  }

  /**
   * @param  {[type]} id   Node id
   * @param  {string} mode [UP, DOWN, LEFT, RIGHT]
   */
  move(_id, { direction, appendToPrev = false } = {}) {
    const node = this.findNode(_id);
    const parent = this.findNode(node.parent_id);
    const nodeIndex = node.order - 1;

    let nodeIsMoved = true;

    switch (direction) {
      case 'UP': {
        // Append to previous node
        if (appendToPrev) {
          if (!nodeIndex) break;
          const prevNode = parent.children[nodeIndex - 1];
          if (prevNode.type !== 'bullet' || prevNode.collapsed) {
            break;
          }
          parent.children.splice(nodeIndex, 1);
          this.add(node, {
            parentNode: prevNode._id,
            order: prevNode.children.length,
            forceUpdate: true
          });
          break;
        }
        // If the node we want to move
        // is not the first child of its parent
        if (nodeIndex !== 0) {
          this.swapChildren(parent, {fromIndex: nodeIndex, toIndex: nodeIndex - 1});
          break;
        }
        // Can not move up node on top
        if (node.parent_id === this.currentViewing) {
          nodeIsMoved = false;
          break;
        }

        const grandparent = this.findNode(parent.parent_id);
        const parentIndex = parent.order - 1;
        // If parent has node above
        // and that node has at least one child
        node.parent_id = grandparent._id || this.rootNode;
        grandparent.children.splice(parentIndex, 0, node);
        //
        parent.children.splice(nodeIndex, 1);
        break;
      }
      case 'DOWN': {
        //
        if (nodeIndex < parent.children.length - 1) {
          this.swapChildren(parent, {fromIndex: nodeIndex, toIndex: nodeIndex + 1});
          break;
        }
        // Can not move down node in bottom
        if (node.parent_id === this.currentViewing) {
          nodeIsMoved = false;
          break;
        }

        let grandparent = this.findNode(parent.parent_id);
        const parentIndex = parent.order - 1;

        node.parent_id = grandparent._id || this.rootNode;
        grandparent.children.splice(parentIndex + 1, 0, node);
        //
        parent.children.splice(nodeIndex, 1);
        break;
      }
      case 'LEFT': {
        // Can not move root node
        if (node.parent_id === this.currentViewing) {
          nodeIsMoved = false;
          break;
        }
        let grandparent = this.findNode(parent.parent_id);
        const parentIndex = parent.order - 1;

        node.parent_id = grandparent._id || this.rootNode;
        grandparent.children.splice(parentIndex + 1, 0, node);
        //
        parent.children.splice(nodeIndex, 1);
        break;
      }
      case 'RIGHT': {
        if (!nodeIndex) {
          nodeIsMoved = false;
          break;
        }
        // Insert this node to the previous sibling
        let aboveNode = parent.children[nodeIndex - 1];

        if (aboveNode.type !== 'bullet') {
          nodeIsMoved = false;
          break;
        }

        aboveNode.collapsed = false;

        node.parent_id = aboveNode._id;

        if (aboveNode.children && aboveNode.children.length) {
          aboveNode.children.push(node);
        } else {
          aboveNode.children = [node];
        }

        // Remove this node out of its current parent
        parent.children.splice(nodeIndex, 1);
        break;
      }
      default:
        nodeIsMoved = false;
        break;
    }

    if (nodeIsMoved) {
      this.delegate.documentDidChange({context: EVENT.MOVE, _id});
      setTimeout(() => this.calculateOrderOfBranch(parent.children));
      const newParent = this.findNode(node.parent_id);
      if (parent._id !== newParent._id) {
        setTimeout(() => this.calculateOrderOfBranch(newParent.children));
      }
    }

    return Promise.resolve(nodeIsMoved);
  }

  traversal(branch, callback) {
    if (Array.isArray(branch)) {
      return this.arrayTraversal(branch, callback);
    }
    let queue = [], visited = {};
    queue.push(branch);
    while (queue.length > 0) {
      const current = queue.pop();
      if (visited[current._id]) {
        continue;
      }
      callback(current);
      visited[current._id] = true;
      queue = queue.concat(current.children);
    }
  }

  arrayTraversal(branch, callback) {
    for (let i = 0; i < branch.length; i++) {
      callback(this.findNode(branch[i]));
    }
  }

  findNode(nodeId) {
    if (!this.map.has(nodeId)) {
      throw new Error(`Node (${nodeId}) does not exist.`);
    }
    return this.map.get(nodeId);
  }

  getPrevNode(id) {
    const { order, parent_id } = this.findNode(id);
    const parent = this.findNode(parent_id);
    if (order >= 2 && (!parent.collapsed || parent._id === this.currentViewing)) {
      return this.findDeepestChild(parent.children[order - 2]);
    }
    return parent;
  }

  getNextNode(id) {
    const node = this.findNode(id);
    const parent = this.findNode(node.parent_id);
    // Last child of parent
    if (node.collapsed && node.order < parent.children.length) {
      return parent.children[node.order];
    }

    return this.getNextNode(parent._id);
  }

  swapChildren(parent, {fromIndex, toIndex} = {}) {
    const temp = parent.children[fromIndex];
    parent.children[fromIndex] = parent.children[toIndex];
    parent.children[toIndex] = temp;
  }

  findDeepestChild(node) {
    if (typeof node === 'string') node = this.findNode(node);
    let clone = Object.create(node);
    let childrenLength = clone.children && clone.children.length;
    while ((!clone.collapsed || clone._id === this.currentViewing) && childrenLength) {
      clone = clone.children[childrenLength - 1];
      childrenLength = clone.children && clone.children.length;
    }
    return clone;
  }

  calculateOrderOfBranch(branch, skipEmit = false) {
    const orderChanges = [];
    for (let i = 0; i < branch.length; i++) {
      if (branch[i].order !== i + 1) {
        orderChanges.push({
          context: EVENT.REF,
          _id: branch[i]._id
        });
        branch[i].order = i + 1;
      }
    }

    if (!skipEmit) {
      this.delegate.documentDidChange(orderChanges);
    }
  }

  caculateAncestors(id, skipEmit = false) {
    const node = this.findNode(id);
    const parent = this.findNode(node.parent_id);
    node.ancestors = (parent.ancestors || [this.rootNode]).concat(node.parent_id);
    if (node.children) {
      for (let i = 0, len = node.children.length; i < len; i++) {
        this.caculateAncestors(node.children[i]._id);
      }
    }
  }

  dispose() {
    this.map.clear();
    this.rootNode = null;
    this.currentViewing = null;
  }
}
