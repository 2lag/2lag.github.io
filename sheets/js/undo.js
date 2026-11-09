const MERGING_EDITS = [
  "insertText",
  "deleteContentBackward",
  "deleteContentForward"
];
let LAST_EDIT = { kind: "", time: 0 };
const UNDO_FUTURE = [];
const UNDO_LIMIT = 300;
const UNDO_PAST = [];

function editorState() {
  return {
    text: EDITOR.value,
    start: EDITOR.selectionStart,
    end: EDITOR.selectionEnd
  };
}

function rememberState( kind ) {
  const now = performance.now();
  const merges = MERGING_EDITS.includes( kind )
              && LAST_EDIT.kind === kind
              && now - LAST_EDIT.time < 1000;
  LAST_EDIT = { kind, time: now };
  UNDO_FUTURE.length = 0;
  if ( merges )
    return;
  UNDO_PAST.push( editorState() );
  if ( UNDO_PAST.length > UNDO_LIMIT )
    UNDO_PAST.shift();
}

function showEdit() {
  EDITOR.dispatchEvent( new Event( "input" ) );
}

function stepHistory( from, to ) {
  if ( !from.length )
    return;
  to.push( editorState() );
  const state = from.pop();
  EDITOR.value = state.text;
  EDITOR.setSelectionRange( state.start, state.end );
  LAST_EDIT = { kind: "", time: 0 };
  showEdit();
}

function undoEdit() {
  stepHistory( UNDO_PAST, UNDO_FUTURE );
}

function redoEdit() {
  stepHistory( UNDO_FUTURE, UNDO_PAST );
}

function editText( start, end, text, select_start, select_end ) {
  rememberState( "command" );
  EDITOR.setRangeText( text, start, end );
  EDITOR.setSelectionRange( select_start, select_end );
  showEdit();
}

EDITOR.addEventListener( "beforeinput",
  event => {
    if ( event.inputType === "historyUndo" ) {
      event.preventDefault();
      undoEdit();
      return;
    }
    if ( event.inputType === "historyRedo" ) {
      event.preventDefault();
      redoEdit();
      return;
    }
    rememberState( event.inputType );
  }
);
