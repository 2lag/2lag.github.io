const UNTYPED_INPUTS = [ "range", "checkbox", "radio", "button" ];
const INDENT = "  ";

function isTypingIn( element ) {
  if ( element.tagName === "TEXTAREA" )
    return true;
  return element.tagName === "INPUT"
      && !UNTYPED_INPUTS.includes( element.type );
}

function comboOf( event ) {
  return [
    ( event.ctrlKey || event.metaKey ) && "ctrl",
    event.altKey && "alt",
    event.shiftKey && "shift",
    event.key.toLowerCase()
  ].filter( Boolean ).join( "+" );
}

function lineAround( text, idx ) {
  const start = text.lastIndexOf( "\n", idx - 1 ) + 1;
  const newline = text.indexOf( "\n", idx );
  const end = newline === -1
    ? text.length
    : newline + 1;
  return { start, end };
}

function selectCurrentLine( keeps_caret ) {
  const caret = EDITOR.selectionStart;
  const { start, end } = lineAround( EDITOR.value, caret );
  EDITOR.setSelectionRange( start, end );
  if ( !keeps_caret )
    return;
  setTimeout(
    () =>
      EDITOR.setSelectionRange( caret, caret )
  );
}

function selectedLines() {
  const text = EDITOR.value;
  const { selectionStart: from, selectionEnd: to } = EDITOR;
  const last = to > from
            && text[ to - 1 ] === "\n"
    ? to - 1
    : to;
  const start = text.lastIndexOf( "\n", from - 1 ) + 1;
  const newline = text.indexOf( "\n", last );
  const end = newline === -1
    ? text.length
    : newline;
  return {
    start, end,
    lines: text.slice( start, end ).split( "\n" )
  };
}

function changeLines( transform ) {
  const { start, end, lines } = selectedLines();
  const changed = lines.map( transform );
  const block = changed.join( "\n" );
  const { selectionStart: from, selectionEnd: to } = EDITOR;
  if ( from !== to ) {
    editText(
      start, end, block,
      start, start + block.length
    );
    return;
  }
  const shift = changed[ 0 ].length - lines[ 0 ].length;
  const caret = Math.max( start, from + shift );
  editText( start, end, block, caret, caret );
}

function indentLines() {
  const { selectionStart: from, selectionEnd: to } = EDITOR;
  if ( from === to ) {
    editText(
      from, from, INDENT,
      from + INDENT.length,
      from + INDENT.length
    );
    return;
  }
  changeLines( line => line && INDENT + line );
}

function outdentLines() {
  changeLines( line => line.replace( /^ {1,2}/, "" ) );
}

function toggleComments() {
  const { lines } = selectedLines();
  const filled = lines.filter( line => line.trim() );
  const commented = filled.length
                 && filled.every(
                      line =>
                        line.trimStart().startsWith( "#" )
                    );
  changeLines(
    line => {
      if ( !line.trim() )
        return line;
      return commented
        ? line.replace( /^(\s*)# ?/, "$1" )
        : `# ${ line }`;
    }
  );
}

function moveLines( direction ) {
  const text = EDITOR.value;
  const { start, end } = selectedLines();
  const block = text.slice( start, end );
  const { selectionStart: from, selectionEnd: to } = EDITOR;
  if ( direction < 0 && start > 0 ) {
    const above = text.lastIndexOf( "\n", start - 2 ) + 1;
    const line = text.slice( above, start - 1 );
    const shift = line.length + 1;
    editText(
      above, end,
      `${ block }\n${ line }`,
      from - shift, to - shift
    );
  }
  if ( direction > 0 && end < text.length ) {
    const newline = text.indexOf( "\n", end + 1 );
    const below = newline === -1 ? text.length : newline;
    const line = text.slice( end + 1, below );
    const shift = line.length + 1;
    editText(
      start, below,
      `${ line }\n${ block }`,
      from + shift, to + shift
    );
  }
}

const EDITOR_KEYS = {
  "tab": indentLines,
  "shift+tab": outdentLines,
  "ctrl+/": toggleComments,
  "alt+arrowup": () => moveLines( -1 ),
  "alt+arrowdown": () => moveLines( 1 ),
  "ctrl+enter": () => PLAY_BUTTON.click(),
  "ctrl+z": undoEdit,
  "ctrl+y": redoEdit,
  "ctrl+shift+z": redoEdit
};

EDITOR.addEventListener( "keydown",
  event => {
    const combo = comboOf( event );
    if ( combo === "ctrl+c"
      || combo === "ctrl+x"
    ) {
      if ( EDITOR.selectionStart === EDITOR.selectionEnd )
        selectCurrentLine( combo === "ctrl+c" );
      return;
    }
    if ( !Object.hasOwn( EDITOR_KEYS, combo ) )
      return;
    event.preventDefault();
    EDITOR_KEYS[ combo ]();
  }
);

document.addEventListener( "keydown",
  event => {
    if ( comboOf( event ) !== "ctrl+a"
      || HELP.open
      || isTypingIn( document.activeElement )
    ) return;
    event.preventDefault();
    EDITOR.focus();
    EDITOR.select();
  }
);
