let FOLLOWED = { sheet: null, events: new Set(), line: 0 };

function followedStaffOf( sheet ) {
  const heard = sheet.staves.filter( staff => !staff.muted );
  return heard[ 0 ] || sheet.staves[ 0 ];
}

function followedEventsOf( sheet ) {
  if ( FOLLOWED.sheet !== sheet )
    FOLLOWED = {
      sheet,
      events: new Set( followedStaffOf( sheet ).events ),
      line: 0
    };
  return FOLLOWED.events;
}

function isComfortablyVisible( top ) {
  const visible_top = EDITOR.scrollTop + EDITOR.clientHeight * 0.15;
  const visible_bottom = EDITOR.scrollTop + EDITOR.clientHeight * 0.75;
  return top >= visible_top && top <= visible_bottom;
}

function followInEditor( event ) {
  const mark = event.textMarks?.[ 0 ];
  if ( !mark
    || !followedEventsOf( SHEET ).has( event )
    || event.line === FOLLOWED.line
  ) return;
  FOLLOWED.line = event.line;
  if ( isComfortablyVisible( mark.offsetTop ) )
    return;
  const top = mark.offsetTop - EDITOR.clientHeight / 3;
  EDITOR.scrollTo({
    top,
    behavior: "smooth"
  });
}

function eventAtCursor() {
  const place = cursorPlace();
  const touched = event => {
    const has_token = event.token && touches( event, place );
    const has_grace = ( event.graceSources || [] ).some(
      source => touches( source, place )
    );
    return has_token || has_grace;
  };
  return SHEET.staves.flatMap( staff => staff.events ).find( touched );
}

function isInView( mark ) {
  const note = mark.getBoundingClientRect();
  const view = SCORE.getBoundingClientRect();
  return note.top >= view.top && note.bottom <= view.bottom;
}

function showEditedNote() {
  const mark = eventAtCursor()?.marks?.[ 0 ];
  if ( mark && !isInView( mark ) ) {
    mark.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth"
    });
  }
}

function toggleListening() {
  document.body.classList.toggle( "listening" );
}

LISTEN_BUTTON.addEventListener( "click", toggleListening );
