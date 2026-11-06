let SHEET = parseSheet( "" );
let PENDING_RENDER = null;
let PROBLEM_MARKS = [];

function columnOf( problem, line_text ) {
  if ( Number.isInteger( problem.column ) )
    return problem.column;
  return Math.max( 0, line_text.indexOf( problem.token ) );
}

function problemRangeOf( problem, line_text ) {
  const start = columnOf( problem, line_text );
  const mark = document.createElement( "mark" );
  mark.dataset.reason = `${ problem.token }: ${ problem.reason }`;
  PROBLEM_MARKS.push( mark );
  const token_length = String( problem.token ).length;
  const end = Math.max( start + 1, start + token_length );
  return { start, end, element: mark };
}

function noteRangesByLine( events ) {
  const by_line = new Map();
  for ( let i = 0; i < events.length; i++ ) {
    const event = events[ i ];
    const sources = sourcesOf( event );
    for ( let j = 0; j < sources.length; j++ ) {
      const source = sources[ j ];
      if ( !source.line || !source.token )
        continue;
      if ( !by_line.has( source.line ) )
        by_line.set( source.line, new Map() );
      const line_map = by_line.get( source.line );
      if ( !line_map.has( source.column ) ) {
        const range = {
          start: source.column,
          end: source.column + source.token.length,
          element: document.createElement( "span" )
        };
        line_map.set( source.column, range );
      }
      event.textMarks.push( line_map.get( source.column ).element );
    }
  }
  return by_line;
}

function sourcesOf( event ) {
  return [
    event,
    ...( event.graceSources || [] )
  ];
}

function markedLine( line_text, ranges ) {
  const pieces = [];
  let written = 0;
  ranges.sort( ( a, b ) => a.start - b.start )
        .forEach( ({ start, end, element }) => {
          if ( start < written )
            return;
          if ( end > start )
            element.textContent = line_text.slice( start, end ) || " ";
          pieces.push( line_text.slice( written, start ), element );
          written = end;
        });
  pieces.push( line_text.slice( written ) );
  return pieces;
}

function showMarks( problems, parsed ) {
  PROBLEM_MARKS = [];
  const events = parsed.staves.flatMap( staff => staff.events );
  events.forEach( event => event.textMarks = [] );
  const measure_starts = measureStartsOf( parsed );
  const lines = EDITOR.value.split( "\n" );
  const events_by_line = noteRangesByLine( events );
  const pieces = lines.flatMap( ( line_text, index ) => {
    const line_number = index + 1;
    const line_problems = problems.filter(
      problem =>
        problem.line === line_number
    );
    const problem_ranges = line_problems.map(
      problem =>
        problemRangeOf( problem, line_text )
    );
    const line_map = events_by_line.get( line_number );
    const note_ranges = line_map ? [ ...line_map.values() ] : [];
    const ranges = [
      ...barRangesOn(
        line_number,
        line_text,
        measure_starts
      ),
      ...problem_ranges,
      ...note_ranges
    ];
    return [ ...markedLine( line_text, ranges ), "\n" ];
  });
  HIGHLIGHTS.replaceChildren( ...pieces, " " );
  followEditorScroll();
}

function followEditorScroll() {
  HIGHLIGHTS.scrollTop = EDITOR.scrollTop;
  HIGHLIGHTS.scrollLeft = EDITOR.scrollLeft;
}

function markUnder( x, y ) {
  return PROBLEM_MARKS.find(
    mark =>
      [ ...mark.getClientRects() ].some(
        box => x >= box.left
            && x <= box.right
            && y >= box.top
            && y <= box.bottom
      )
  );
}

function showProblemTip( event ) {
  const mark = markUnder( event.clientX, event.clientY );
  PROBLEM_TIP.classList.toggle( "shown", Boolean( mark ) );
  if ( !mark )
    return;
  PROBLEM_TIP.textContent = mark.dataset.reason;
  PROBLEM_TIP.style.left = event.clientX + 12 + "px";
  PROBLEM_TIP.style.top = event.clientY + 16 + "px";
}

function hideProblemTip() {
  PROBLEM_TIP.classList.remove( "shown" );
}

function refreshScore() {
  stopPlayback();
  SHEET = parseSheet( EDITOR.value );
  renderScore( SHEET );
  PLAYBACK_POSITION = Math.min(
    PLAYBACK_POSITION,
    totalDurationOf( SHEET )
  );
  showPosition( PLAYBACK_POSITION );
  if ( PLAYBACK_POSITION > 0 )
    placePlayhead( PLAYBACK_POSITION, false );
  showMarks( SHEET.problems, SHEET );
  rememberSheet( EDITOR.value );
  showNoteHint();
  showSheetInstruments();
}

function refreshSoon() {
  clearTimeout( PENDING_RENDER );
  PENDING_RENDER = setTimeout(
    () => {
      refreshScore();
      showEditedNote();
    },
    150
  );
}

function resizePanels( event ) {
  const bounds = WORKSPACE.getBoundingClientRect();
  const percent = ( event.clientX - bounds.left ) / bounds.width * 100;
  WRITING.style.width = Math.min( 80, Math.max( 15, percent ) ) + "%";
}

function stopResizing() {
  document.body.classList.remove( "resizing" );
  document.removeEventListener( "pointermove", resizePanels );
}

function closeExportMenu() {
  EXPORT_MENU.classList.remove( "open" );
}

function placeMenu( menu ) {
  menu.style.top = `${ HEADER.getBoundingClientRect().bottom }px`;
}

new ResizeObserver(
  () => [ EXPORT_MENU, LOOK_MENU ].forEach( placeMenu )
).observe( HEADER );

function closeLookMenu() {
  LOOK_MENU.classList.remove( "open" );
}

SPLITTER.addEventListener( "pointerdown",
  event => {
    event.preventDefault();
    document.body.classList.add( "resizing" );
    document.addEventListener( "pointermove", resizePanels );
    document.addEventListener( "pointerup", stopResizing, { once: true } );
  }
);

EXPORT_BUTTON.addEventListener( "click",
  event => {
    event.stopPropagation();
    SOUND_PANEL.classList.remove( "open" );
    closeLookMenu();
    closePopups();
    placeMenu( EXPORT_MENU );
    EXPORT_MENU.classList.toggle( "open" );
  }
);

LOOK_BUTTON.addEventListener( "click",
  event => {
    event.stopPropagation();
    SOUND_PANEL.classList.remove( "open" );
    closeExportMenu();
    closePopups();
    placeMenu( LOOK_MENU );
    LOOK_MENU.classList.toggle( "open" );
  }
);

document.addEventListener( "click",
  event => {
    if ( !EXPORT_MENU.contains( event.target ) )
      closeExportMenu();
    if ( !LOOK_MENU.contains( event.target ) )
      closeLookMenu();
  }
);

HELP_BUTTON.addEventListener( "click", () => HELP.showModal() );
CLOSE_HELP_BUTTON.addEventListener( "click", () => HELP.close() );

HELP.addEventListener( "click",
  event => {
    const box = HELP.getBoundingClientRect();
    const clicked_outside = event.clientX < box.left
                         || event.clientX > box.right
                         || event.clientY < box.top
                         || event.clientY > box.bottom;
  if ( event.target === HELP && clicked_outside )
    HELP.close();
});

EDITOR.addEventListener( "input",
  () => {
    showMarks( [], parseSheet( EDITOR.value ) );
    refreshSoon();
  }
);
EDITOR.addEventListener( "scroll", followEditorScroll );
EDITOR.addEventListener( "mousemove", showProblemTip );
EDITOR.addEventListener( "mouseleave", hideProblemTip );
Promise.allSettled([
  document.fonts.load( "28px Bravura" ),
  SHEET_LOADED
]).then( refreshScore );
