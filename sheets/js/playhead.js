const PLAYHEAD = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "rect"
);
let PLAYHEAD_SYSTEM = null;
let PLAYHEAD_FRAME = null;

PLAYHEAD.setAttribute( "class", "playhead" );
PLAYHEAD.setAttribute( "width", 0.5 * SPACE );
PLAYHEAD.setAttribute( "rx", 0.25 * SPACE );

function playheadXAt( time ) {
  const matches = stop => stop.time <= time + EPSILON;
  const index = Math.max( 0, PLAYHEAD_STOPS.findLastIndex( matches ) );
  const stop = PLAYHEAD_STOPS[ index ];
  const next = PLAYHEAD_STOPS[ index + 1 ];
  if ( !next || next.system !== stop.system ) {
    return {
      x: stop.x,
      system: stop.system
    };
  }
  const progress = ( time - stop.time ) / ( next.time - stop.time );
  const x = stop.x + ( next.x - stop.x ) * Math.min( 1, progress );
  return { x, system: stop.system };
}

function placePlayhead( time, follow_it = true ) {
  if ( !PLAYHEAD_STOPS.length )
    return;
  const { x, system } = playheadXAt( scorePositionOf( time ) );
  PLAYHEAD.setAttribute( "x", x - 0.25 * SPACE );
  if ( system === PLAYHEAD_SYSTEM )
    return;
  PLAYHEAD_SYSTEM = system;
  const top = system.y + system.staffTops[ 0 ] - 2 * SPACE;
  const bottom = system.y + system.staffTops.at( -1 ) + 6 * SPACE;
  PLAYHEAD.setAttribute( "y", top );
  PLAYHEAD.setAttribute( "height", bottom - top );
  system.page.appendChild( PLAYHEAD );
  if ( follow_it ) {
    PLAYHEAD.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth"
    });
  }
}

function startPlayhead() {
  const follow = () => {
    if ( !PLAYING )
      return;
    const position = currentPosition();
    placePlayhead( position );
    showPosition( position );
    PLAYHEAD_FRAME = requestAnimationFrame( follow );
  };
  follow();
}

function stopPlayhead() {
  cancelAnimationFrame( PLAYHEAD_FRAME );
  PLAYHEAD_SYSTEM = null;
  PLAYHEAD.remove();
}
