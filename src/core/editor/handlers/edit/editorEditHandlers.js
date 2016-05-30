import onBeforeInput from './editOnBeforeInput'
// import onBlur from './editOnBlur';
// import onCompositionStart from './editOnCompositionStart';
import onCopy from './editOnCopy';
import onCut from './editOnCut';
// import onDragOver from './editOnDragOver';
// import onDragStart from './editOnDragStart';
// import onFocus from './editOnFocus';
// import onInput from './editOnInput';
// import onPaste from './editOnPaste';
import onKeyDown from './editOnKeyDown'
import onKeyUp from './editOnKeyUp'
import onSelect from './editOnSelect'

const editorEditHandlers = {
  onBeforeInput,
  // onBlur,
  // onCompositionStart,
  onCopy,
  onCut,
  // onDragOver,
  // onDragStart,
  // onFocus,
  // onInput,
  // onPaste,
  onKeyDown,
  onKeyUp,
  onSelect,
}

export default editorEditHandlers
