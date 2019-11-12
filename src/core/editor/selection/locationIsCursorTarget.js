import findNodeAndOffsetFromLocation from './findNodeAndOffsetFromLocation'
import EditorDOMHandler from 'core/editor/dom'

const DOMUtil = EditorDOMHandler.DOMUtil

export default function locationIsCursorTarget (location) {
  const [node] = findNodeAndOffsetFromLocation(location)
  return DOMUtil.nodeIsCursorTarget(node)
}
