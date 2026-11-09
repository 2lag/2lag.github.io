let RESUME_AFTER_SEEKING = false;
let SEEKER_BOXES = null;

function seekerBoxesOf() {
  SEEKER_BOXES ??= {
    track: SEEKER.getBoundingClientRect(),
    bar: TRANSPORT.getBoundingClientRect(),
    thumb: SEEKER_THUMB.getBoundingClientRect()
  };
  return SEEKER_BOXES;
}

function remeasureSeeker() {
  SEEKER_BOXES = null;
  placeSeekerThumb();
}

function placeSeekerThumb() {
  const { track, bar, thumb } = seekerBoxesOf();
  const travel = track.width - thumb.width;
  const left = track.left - bar.left + travel * SEEKER.value / SEEKER.max;
  const top = track.top - bar.top + ( track.height - thumb.height ) / 2;
  const snap = pixels => {
    const scaled = pixels * devicePixelRatio;
    return Math.round( scaled ) / devicePixelRatio;
  };
  const x = snap( left );
  const y = snap( top );
  SEEKER_THUMB.style.transform = `translate( ${ x }px, ${ y }px )`;
}

function clockTimeOf( seconds ) {
  const whole_seconds = Math.floor( seconds );
  const minutes = Math.floor( whole_seconds / 60 );
  const seconds_part = String( whole_seconds % 60 ).padStart( 2, "0" );
  return `${ minutes }:${ seconds_part }`;
}

function showPosition( position ) {
  const pass_length = passLengthOf( SHEET );
  const shown = shownPositionOf( position );
  const seconds_per_whole_note = secondsPerWholeNoteOf( SHEET );
  const total_seconds = pass_length * seconds_per_whole_note;
  const total = SHEET.loop ? "∞" : clockTimeOf( total_seconds );
  SEEKER.value = pass_length ? shown / pass_length * SEEKER.max : 0;
  const shown_seconds = shown * seconds_per_whole_note;
  const clock = `${ clockTimeOf( shown_seconds ) } / ${ total }`;
  if ( CLOCK.textContent !== clock ) {
    CLOCK.textContent = clock;
    SEEKER_BOXES = null;
  }
  placeSeekerThumb();
}

function positionOfSeeker() {
  return SEEKER.value / SEEKER.max * passLengthOf( SHEET );
}

SEEKER.addEventListener( "input",
  () => {
    if ( HOLDING )
      stopPlayback();
    if ( PLAYING ) {
      RESUME_AFTER_SEEKING = true;
      stopPlayback();
    }
    PLAYBACK_POSITION = positionOfSeeker();
    placePlayhead( PLAYBACK_POSITION );
    showPosition( PLAYBACK_POSITION );
  }
);

SEEKER.addEventListener( "change",
  () => {
    if ( RESUME_AFTER_SEEKING )
      startPlayback();
    RESUME_AFTER_SEEKING = false;
  }
);

ERA_STYLE.addEventListener( "load", remeasureSeeker );

const SEEKER_WATCH = new ResizeObserver( remeasureSeeker );
SEEKER_WATCH.observe( TRANSPORT );
SEEKER_WATCH.observe( SEEKER );
SEEKER_WATCH.observe( SEEKER_THUMB );
