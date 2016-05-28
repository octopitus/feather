import { normalizeSpaces, summarizeStringChange } from 'core/editor/utils/string'

function nodeIsEmptyTextNode (node) {
  return node && node.nodeType === Node.TEXT_NODE && node.data === ''
}

export default class MutationObserver {

  options = {
    attributes: true,
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    subtree: true
  };

  mutations = [];

  delegate = null;

  constructor () {
    this.observer = new global.MutationObserver(this.didMutate.bind(this))
  }

  observe (element) {
    this.reset()
    this.element = element
    this.observer.observe(this.element, this.options)
  }

  dispose () {
    this.reset()
    this.observer.disconnect()
  }

  reset () {
    this.observer.takeRecords()
    this.mutations = []
  }

  didMutate (mutations) {
    this.mutations.push(...this.findSignificantMutations(mutations))
    if (this.mutations.length) {
      if (this.delegate && typeof this.delegate.elementDidMutate === 'function') {
        this.delegate.elementDidMutate(this.getMutationSummary())
      }
      this.reset()
    }
  }

  findSignificantMutations (mutations) {
    let results = []
    for (let i = 0, len = mutations.length; i < len; i++) {
      let mutation = mutations[i]
      if (this.mutationIsSignificant(mutation)) {
        results.push(mutation)
      }
    }
    return results
  }

  mutationIsSignificant (mutation) {
    const ref = this.nodesModifiedByMutation(mutation)
    for (let i = 0, len = ref.length; i < len; i++) {
      let node = ref[i]
      if (this.nodeIsSignificant(node)) {
        return true
      }
    }
    return false
  }

  nodeIsSignificant (node) {
    return node !== this.element && !nodeIsEmptyTextNode(node)
  }

  nodesModifiedByMutation (mutation) {
    let nodes = []
    switch (mutation.type) {
      case 'attributes':
        nodes.push(mutation.target)
        break
      case 'characterData':
        nodes.push(mutation.target.parentNode)
        nodes.push(mutation.target)
        break
      case 'childList':
        nodes.push.apply(nodes, mutation.addedNodes)
        nodes.push.apply(nodes, mutation.removedNodes)
        break
      default:
        break
    }
    return nodes
  }

  getMutationSummary () {
    return this.getTextMutationSummary()
  }

  getTextMutationSummary () {
    const { additions, deletions } = this.getTextChangesFromCharacterData()
    const textChanges = this.getTextChangesFromTextNodes()

    for (let i = 0, len = textChanges.additions.length; i < len; i++) {
      let addition = textChanges.additions[i]
      if (additions.indexOf(addition) < 0) {
        additions.push(addition)
      }
    }

    deletions.push(...textChanges.deletions)

    return {
      textAdded: additions.join(''),
      textDeleted: deletions.join('')
    }
  }

  getMutationsByType (type) {
    let results = []
    for (let i = 0, len = this.mutations.length; i < len; i++) {
      let mutation = this.mutations[i]
      if (mutation.type === type) {
        results.push(mutation)
      }
    }
    return results
  }

  getTextChangesFromTextNodes () {
    const childList = this.getMutationsByType('childList')

    let nodesAdded = []
    let nodesRemoved = []

    for (let i = 0, len = childList.length; i < len; i++) {
      const mutation = childList[i]
      const removedNodes = mutation.removedNodes
      for (let j = 0, len1 = removedNodes.length; j < len1; j++) {
        const node = removedNodes[j]
        if (node.nodeType === Node.TEXT_NODE) {
          nodesRemoved.push(node)
        }
      }
      const addedNodes = mutation.addedNodes
      for (let k = 0, len2 = addedNodes.length; k < len2; k++) {
        const node = addedNodes[k]
        if (node.nodeType === Node.TEXT_NODE) {
          nodesAdded.push(node)
        }
      }
    }

    const additions = (() => {
      let results = []
      for (let index = 0, len = nodesAdded.length; index < len; index++) {
        let node = nodesAdded[index]
        if (node.data !== (nodesRemoved[index] && nodesRemoved[index].data)) {
          results.push(normalizeSpaces(node.data))
        }
      }
      return results
    })()

    const deletions = (() => {
      let results = []
      for (let index = 0, len = nodesRemoved.length; index < len; index++) {
        let node = nodesRemoved[index]
        if (node && node.data !== (nodesAdded[index] && nodesAdded[index].data)) {
          results.push(normalizeSpaces(node.data))
        }
      }
      return results
    })()

    return { additions, deletions }
  }

  getTextChangesFromCharacterData () {
    const characterMutations = this.getMutationsByType('characterData')
    let added, removed
    if (characterMutations.length) {
      const startMutation = characterMutations[0]
      const endMutation = characterMutations[characterMutations.length - 1]
      const oldString = normalizeSpaces(startMutation.oldValue)
      const newString = normalizeSpaces(endMutation.target.data)
      const stringChanges = summarizeStringChange(oldString, newString)
      added = stringChanges.added
      removed = stringChanges.removed
    }
    return {
      additions: added ? [added] : [],
      deletions: removed ? [removed] : []
    }
  }
}
