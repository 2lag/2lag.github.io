const TYPING_EDITS = {
  insertText: { before: 0, after: 0 },
  insertLineBreak: { before: 0, after: 0 },
  deleteContentBackward: { before: 1, after: 0 },
  deleteContentForward: { before: 0, after: 1 }
};
let EXTRA_CARETS = [];
let COPIED_PIECES = [];

function pointsAt( offsets ) {
  const sorted = [ ...new Set( offsets ) ].sort( ( a, b ) => a - b );
  const points = new Map();
  const walker = document.createTreeWalker(
    HIGHLIGHTS, NodeFilter.SHOW_TEXT
  );
  let passed = 0;
  let next = 0;
  let last = null;
  while ( next < sorted.length && walker.nextNode() ) {
    last = walker.currentNode;
    const end = passed + last.length;
    for ( ; next < sorted.length && sorted[ next ] < end; ++next )
      points.set(
        sorted[ next ],
        { node: last, offset: sorted[ next ] - passed }
      );
    passed = end;
  }
  if ( last && sorted.includes( passed ) )
    points.set( passed, { node: last, offset: last.length } );
  return points;
}

function rectsBetween( points, from, to ) {
  const start = points.get( from );
  const end = points.get( to );
  if ( !start || !end )
    return [];
  const range = document.createRange();
  range.setStart( start.node, start.offset );
  range.setEnd( end.node, end.offset );
  const rects = [ ...range.getClientRects() ];
  return rects.length || from !== to
    ? rects
    : [ range.getBoundingClientRect() ];
}

function markOf( class_name, rect, frame ) {
  const mark = document.createElement( "span" );
  mark.className = class_name;
  Object.assign(
    mark.style,
    {
      left: `${ rect.left - frame.left + HIGHLIGHTS.scrollLeft }px`,
      top: `${ rect.top - frame.top + HIGHLIGHTS.scrollTop }px`,
      width: `${ rect.width }px`,
      height: `${ rect.height }px`
    }
  );
  return mark;
}

function drawExtraCarets() {
  HIGHLIGHTS.querySelectorAll( ".extraCaret, .extraSelection" )
            .forEach( mark => mark.remove() );
  if ( !EXTRA_CARETS.length )
    return;
  const frame = HIGHLIGHTS.getBoundingClientRect();
  const points = pointsAt(
    EXTRA_CARETS.flatMap( caret => [ caret.anchor, caret.head ] )
  );
  const marks = EXTRA_CARETS.flatMap(
    ({ anchor, head }) => {
      const { from, to } = selectionOf({ anchor, head });
      const selection = from === to
        ? []
        : rectsBetween( points, from, to );
      const caret = rectsBetween( points, head, head ).slice( 0, 1 );
      return [
        ...selection.map( rect => markOf( "extraSelection", rect, frame ) ),
        ...caret.map( rect => markOf( "extraCaret", rect, frame ) )
      ];
    }
  );
  HIGHLIGHTS.append( ...marks );
}

function clearExtraCarets() {
  if ( !EXTRA_CARETS.length )
    return;
  EXTRA_CARETS = [];
  drawExtraCarets();
}

function lineStartOf( text, caret ) {
  return text.lastIndexOf( "\n", caret - 1 ) + 1;
}

function lineEndOf( text, caret ) {
  const newline = text.indexOf( "\n", caret );
  return newline === -1
    ? text.length
    : newline;
}

function caretOnLine( text, caret, direction ) {
  const line_start = lineStartOf( text, caret );
  const target_start = direction < 0
    ? lineStartOf( text, line_start - 1 )
    : text.indexOf( "\n", caret ) + 1;
  if ( direction < 0
         ? !line_start
         : !target_start
  ) return caret;
  const column = caret - line_start;
  return Math.min(
    target_start + column,
    lineEndOf( text, target_start )
  );
}

function wordStepOf( text, caret, direction ) {
  const next = i => text[ direction < 0 ? i - 1 : i ];
  let idx = caret;
  while ( next( idx ) !== undefined && !/\w/.test( next( idx ) ) )
    idx += direction;
  while ( next( idx ) !== undefined && /\w/.test( next( idx ) ) )
    idx += direction;
  return idx;
}

const CARET_MOVES = {
  arrowleft: ( _, caret, anchor ) =>
    anchor === caret
      ? Math.max( 0, caret - 1 )
      : Math.min( caret, anchor ),
  arrowright: ( text, caret, anchor ) =>
    anchor === caret
      ? Math.min( text.length, caret + 1 )
      : Math.max( caret, anchor ),
  arrowup: ( text, caret ) => {
    const moved = caretOnLine( text, caret, -1 );
    return moved === caret
      ? 0
      : moved;
  },
  arrowdown: ( text, caret ) => {
    const moved = caretOnLine( text, caret, 1 );
    return moved === caret
      ? text.length
      : moved;
  },
  home: lineStartOf,
  end: lineEndOf
};

const WORD_MOVES = {
  arrowleft: ( text, caret ) => wordStepOf( text, caret, -1 ),
  arrowright: ( text, caret ) => wordStepOf( text, caret, 1 ),
  home: () => 0,
  end: text => text.length
};

function caretMoveOf( event ) {
  if ( event.altKey )
    return null;
  const key = event.key.toLowerCase();
  const moves = event.ctrlKey || event.metaKey
    ? WORD_MOVES
    : CARET_MOVES;
  return Object.hasOwn( moves, key )
    ? moves[ key ]
    : null;
}

function primaryCaret() {
  const { selectionStart: start, selectionEnd: end } = EDITOR;
  return EDITOR.selectionDirection === "backward"
    ? { anchor: end, head: start }
    : { anchor: start, head: end };
}

function addCaret( direction ) {
  EDITOR.setSelectionRange( EDITOR.selectionStart, EDITOR.selectionStart );
  const heads = [
    EDITOR.selectionStart,
    ...EXTRA_CARETS.map( caret => caret.head )
  ];
  const base = direction < 0
    ? Math.min( ...heads )
    : Math.max( ...heads );
  const head = caretOnLine( EDITOR.value, base, direction );
  if ( !heads.includes( head ) )
    EXTRA_CARETS.push({ anchor: head, head });
  drawExtraCarets();
}

function movedCaret( caret, move, selects ) {
  const anchor = selects
    ? caret.head
    : caret.anchor;
  const head = move( EDITOR.value, caret.head, anchor );
  return {
    anchor: selects
      ? caret.anchor
      : head,
    head
  };
}

function placePrimary({ anchor, head }) {
  EDITOR.setSelectionRange(
    Math.min( anchor, head ),
    Math.max( anchor, head ),
    head < anchor
      ? "backward"
      : "forward"
  );
}

function moveCarets( move, selects ) {
  const primary = movedCaret( primaryCaret(), move, selects );
  placePrimary( primary );
  const heads = new Set([ primary.head ]);
  EXTRA_CARETS = EXTRA_CARETS
    .map( caret => movedCaret( caret, move, selects ) )
    .filter(
      caret => {
        if ( heads.has( caret.head ) )
          return false;
        heads.add( caret.head );
        return true;
      }
    );
  drawExtraCarets();
}

function moveCaretLines( direction ) {
  const primary = primaryCaret();
  const offsets = [ primary, ...EXTRA_CARETS ]
    .flatMap( caret => [ caret.anchor, caret.head ] );
  const from = Math.min( ...offsets );
  const to = lineEndOf( EDITOR.value, Math.max( ...offsets ) );
  EDITOR.setSelectionRange( from, to );
  moveLines( direction );
  const shift = EDITOR.selectionStart - from;
  const shifted = ({ anchor, head }) => ({
    anchor: anchor + shift,
    head: head + shift
  });
  placePrimary( shifted( primary ) );
  EXTRA_CARETS = EXTRA_CARETS.map( shifted );
  drawExtraCarets();
}

function deselect() {
  const { head } = primaryCaret();
  EDITOR.setSelectionRange( head, head );
  clearExtraCarets();
}

function cutOf( caret, edit, length ) {
  const { from, to } = selectionOf( caret );
  if ( from !== to )
    return { from, to };
  return {
    from: Math.max( 0, from - edit.before ),
    to: Math.min( length, to + edit.after )
  };
}

function replaceSpans( spans ) {
  const text = EDITOR.value;
  const placed = [];
  let result = "";
  let written = 0;
  [ ...spans ]
    .sort( ( a, b ) => a.from - b.from )
    .forEach(
      ({ from, to, insert }) => {
        if ( to < written )
          return;
        result += text.slice(
          written,
          Math.max( written, from )
        ) + insert;
        placed.push( result.length );
        written = to;
      }
    );
  result += text.slice( written );
  EDITOR.value = result;
  EDITOR.setSelectionRange( placed[ 0 ], placed[ 0 ] );
  EXTRA_CARETS = placed
    .slice( 1 )
    .map( head => ({ anchor: head, head }) );
  showEdit();
}

function allCarets() {
  return [ primaryCaret(), ...EXTRA_CARETS ];
}

function editAtCarets( edit, insert ) {
  const length = EDITOR.value.length;
  replaceSpans(
    allCarets().map(
      caret => ({ ...cutOf( caret, edit, length ), insert })
    )
  );
}

function selectionOf({ anchor, head }) {
  return {
    from: Math.min( anchor, head ),
    to: Math.max( anchor, head )
  };
}

function copiedSpanOf( caret ) {
  if ( caret.anchor !== caret.head )
    return selectionOf( caret );
  const { start, end } = lineAround( EDITOR.value, caret.head );
  return { from: start, to: end };
}

function copiedSpansOf() {
  return allCarets()
    .map( copiedSpanOf )
    .sort( ( a, b ) => a.from - b.from );
}

function copyAtCarets( event ) {
  const spans = copiedSpansOf();
  COPIED_PIECES = spans.map(
    ({ from, to }) => EDITOR.value.slice( from, to ).replace( /\n$/, "" )
  );
  event.clipboardData.setData(
    "text/plain",
    COPIED_PIECES.join( "\n" )
  );
  return spans;
}

function pasteAtCarets( text ) {
  const spans = allCarets()
    .map( selectionOf )
    .sort( ( a, b ) => a.from - b.from );
  const spreads = COPIED_PIECES.length === spans.length
               && COPIED_PIECES.join( "\n" ) === text;
  const last = spans.length - 1;
  replaceSpans(
    spans.map(
      ( span, idx ) => {
        if ( spreads )
          return { ...span, insert: COPIED_PIECES[ idx ] };
        return idx === last
          ? { ...span, insert: text }
          : { from: span.to, to: span.to, insert: "" };
      }
    )
  );
}

EDITOR.addEventListener( "beforeinput",
  event => {
    if ( !EXTRA_CARETS.length )
      return;
    const edit = TYPING_EDITS[ event.inputType ];
    if ( !edit ) {
      clearExtraCarets();
      return;
    }
    event.preventDefault();
    const insert = event.inputType === "insertLineBreak"
      ? "\n"
      : event.data ?? "";
    editAtCarets( edit, insert );
  }
);

const CARET_KEYS = {
  "alt+shift+arrowup": () => addCaret( -1 ),
  "alt+shift+arrowdown": () => addCaret( 1 ),
  "escape": deselect
};

const LINE_MOVES = {
  "alt+arrowup": -1,
  "alt+arrowdown": 1
};

const CLIPBOARD_KEYS = [ "ctrl+c", "ctrl+x", "ctrl+v" ];

const KEEPS_CARETS = [
  "Backspace", "Delete", "Enter",
  "Shift", "Control", "Alt", "Meta"
];

EDITOR.addEventListener( "keydown",
  event => {
    const combo = comboOf( event );
    if ( Object.hasOwn( CARET_KEYS, combo ) ) {
      event.preventDefault();
      CARET_KEYS[ combo ]();
      return;
    }
    if ( EXTRA_CARETS.length && Object.hasOwn( LINE_MOVES, combo ) ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      moveCaretLines( LINE_MOVES[ combo ] );
      return;
    }
    if ( EXTRA_CARETS.length && CLIPBOARD_KEYS.includes( combo ) ) {
      event.stopImmediatePropagation();
      return;
    }
    const move = EXTRA_CARETS.length && caretMoveOf( event );
    if ( move ) {
      event.preventDefault();
      moveCarets( move, event.shiftKey );
      return;
    }
    const types = event.key.length === 1
               && !event.ctrlKey
               && !event.metaKey;
    if ( !types && !KEEPS_CARETS.includes( event.key ) )
      clearExtraCarets();
  }
);

EDITOR.addEventListener( "mousedown", clearExtraCarets );
EDITOR.addEventListener( "blur", clearExtraCarets );

EDITOR.addEventListener( "copy",
  event => {
    if ( !EXTRA_CARETS.length )
      return;
    event.preventDefault();
    copyAtCarets( event );
  }
);

EDITOR.addEventListener( "cut",
  event => {
    if ( !EXTRA_CARETS.length )
      return;
    event.preventDefault();
    const spans = copyAtCarets( event );
    rememberState( "command" );
    replaceSpans( spans.map( span => ({ ...span, insert: "" }) ) );
  }
);

EDITOR.addEventListener( "paste",
  event => {
    if ( !EXTRA_CARETS.length )
      return;
    event.preventDefault();
    rememberState( "command" );
    const text = event.clipboardData.getData( "text/plain" );
    pasteAtCarets( text.replace( /\r\n?/g, "\n" ) );
  }
);
