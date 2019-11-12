import onBeforeInput from './editOnBeforeInput'
// import onBlur from './editOnBlur';
// import onCompositionStart from './editOnCompositionStart';
import onCopy from './editOnCopy'
import onCut from './editOnCut'
// import onDragOver from './editOnDragOver';
// import onDragStart from './editOnDragStart';
// import onFocus from './editOnFocus';
// import onInput from './editOnInput';
import onPaste from './editOnPaste'
import onKeyDown from './editOnKeyDown'
import onKeyUp from './editOnKeyUp'
import onSelect from './editOnSelect'

const editorEditHandlers = {
  // onCompositionStart,
  onBeforeInput,
  // onInput,
  // onBlur,
  // onFocus,
  onCopy,
  onCut,
  onPaste,
  // onDragOver,
  // onDragStart,
  onKeyDown,
  onKeyUp,
  onSelect
}

export default editorEditHandlers
