const GRABBABLE_EXCEPT = [ "INPUT", "SELECT", "OPTION", "BUTTON", "TEXTAREA" ];
let DRAG_OFFSET = null;

function hasTitleBar() {
  return getComputedStyle( SOUND_TITLE ).display !== "none";
}

function canGrab( target ) {
  return hasTitleBar()
    ? SOUND_TITLE.contains( target )
    : !GRABBABLE_EXCEPT.includes( target.tagName );
}

function placeSoundPanel( left, top ) {
  const box = SOUND_PANEL.getBoundingClientRect();
  const kept_left = Math.min( Math.max( 0, left ), innerWidth - box.width );
  const max_top = innerHeight - Math.min( box.height, 48 );
  const kept_top = Math.min( Math.max( 0, top ), max_top );
  SOUND_PANEL.classList.add( "moved" );
  const style = { left: `${ kept_left }px`, top: `${ kept_top }px` };
  Object.assign( SOUND_PANEL.style, style );
}

SOUND_PANEL.addEventListener( "pointerdown",
  event => {
    if ( !canGrab( event.target ) )
      return;
    event.preventDefault();
    const box = SOUND_PANEL.getBoundingClientRect();
    DRAG_OFFSET = { x: event.clientX - box.left, y: event.clientY - box.top };
    SOUND_PANEL.setPointerCapture( event.pointerId );
    document.body.classList.add( "dragging" );
  }
);

SOUND_PANEL.addEventListener( "pointermove",
  event => {
    if ( !DRAG_OFFSET )
      return;
    placeSoundPanel(
      event.clientX - DRAG_OFFSET.x,
      event.clientY - DRAG_OFFSET.y
    );
  }
);

function dragEnd() {
  DRAG_OFFSET = null;
  document.body.classList.remove( "dragging" );
}

SOUND_PANEL.addEventListener( "pointerup", dragEnd );
SOUND_PANEL.addEventListener( "pointercancel", dragEnd );

addEventListener( "resize", () => {
  if ( !SOUND_PANEL.classList.contains( "moved" ) )
    return;
  placeSoundPanel(
    parseFloat( SOUND_PANEL.style.left ),
    parseFloat( SOUND_PANEL.style.top )
  );
});
