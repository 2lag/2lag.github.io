const HIDDEN_LOOKAHEAD_SECONDS = 45;
const PERFORMANCES = new WeakMap();
const LOOKAHEAD_SECONDS = 2;
let PLAYBACK_TIMEOUT = null;
const ENDLESS_MINUTES = 30;
let HIGHLIGHT_FRAME = null;
let PLAYBACK_ORIGIN = null;
let SCHEDULER_TIMER = null;
let PLAYBACK_POSITION = 0;
const LATE_SECONDS = 0.05;
let AUDIO_CONTEXT = null;
let HIGHLIGHT_QUEUE = [];
const MOST_SWING = 0.985;
let HIGHLIGHT_INDEX = 0;
let ACTIVE_PLAN = null;
let HELD_NOTES = [];
let HOLDING = false;
let PLAYING = false;

function secondsPerWholeNoteOf( sheet ) {
  return 240 / sheet.bpm;
}

function timedSegmentsOf( segments ) {
  let performed_start = 0;
  return segments.map( segment => {
    const timed = {
      ...segment,
      performedStart: performed_start
    };
    performed_start += segment.end - segment.start;
    return timed;
  });
}

function lengthOfSegments( segments ) {
  return segments.reduce(
    ( total, segment ) =>
      total + segment.end - segment.start,
    0
  );
}

function onePassOf( sheet ) {
  const staff_lengths = sheet.staves.map( staffLengthOf );
  const song_length = sheet.loop
    ? sheet.loop.end
    : Math.max( ...staff_lengths );
  return performanceSegmentsOf(
    sheet.repeats || [],
    song_length
  );
}

function loopBodyOf( sheet ) {
  const segments = unfold(
    sheet.repeats || [],
    sheet.loop.start,
    sheet.loop.end,
    1
  );
  return joinedSegments( segments );
}

function endlessPerformanceOf( sheet ) {
  const body = loopBodyOf( sheet );
  const body_length = lengthOfSegments( body );
  const whole_note_seconds = secondsPerWholeNoteOf( sheet );
  const loops = Math.max(
    1,
    Math.ceil(
      ENDLESS_MINUTES * 60 / whole_note_seconds / body_length
    )
  );
  const repeats = Array.from(
    { length: loops },
    () => body
  ).flat();
  return [
    ...onePassOf( sheet ),
    ...repeats
  ];
}

function performanceOf( sheet ) {
  if ( !PERFORMANCES.has( sheet ) ) {
    const segments = sheet.loop
      ? endlessPerformanceOf( sheet )
      : onePassOf( sheet );
    PERFORMANCES.set(
      sheet,
      timedSegmentsOf( segments )
    );
  }
  return PERFORMANCES.get( sheet );
}

function onePassPerformanceOf( sheet ) {
  return timedSegmentsOf( onePassOf( sheet ) );
}

function totalDurationOf( sheet ) {
  return lengthOfSegments( performanceOf( sheet ) );
}

function passLengthOf( sheet ) {
  return lengthOfSegments( onePassOf( sheet ) );
}

function shownPositionOf( position ) {
  const pass = passLengthOf( SHEET );
  if ( !SHEET.loop || position <= pass + EPSILON )
    return position;
  const body = lengthOfSegments( loopBodyOf( SHEET ) );
  return pass - body + ( position - pass ) % body;
}

function scorePositionOf( performed ) {
  const performance = performanceOf( SHEET );
  const segment = performance.findLast(
    candidate =>
      candidate.performedStart <= performed + EPSILON
  ) || performance[ 0 ];
  if ( !segment )
    return performed;
  return Math.min(
    segment.end,
    segment.start + performed - segment.performedStart
  );
}

function timedEventsOf( staff ) {
  let position = 0;
  return staff.events.map( ( event, index ) => {
    const start = position;
    position += lengthOf( event );
    return {
      event,
      index,
      start,
      end: position
    };
  });
}

function occurrencesOf( staff, performance ) {
  const timed = timedEventsOf( staff );
  return performance.flatMap(
    segment =>
      timed.filter(
        item => item.start < segment.end - EPSILON
             && item.end > segment.start + EPSILON
      ).map(
        item => ({
          ...item,
          segment,
          performedAt:
            position =>
              segment.performedStart + position - segment.start
        })
      )
  );
}

function nextFermataAfter( from, performance ) {
  const ends = SHEET.staves.flatMap(
    staff => occurrencesOf( staff, performance ).filter(
               item => item.event.articulations?.includes( "fermata" )
                    && item.end <= item.segment.end + EPSILON
             ).map( item => item.performedAt( item.end ) )
  );
  return Math.min(
    Infinity,
    ...ends.filter( end => end > from + EPSILON )
  );
}

function soundStyleOf( event ) {
  const articulations = event.articulations || [];
  return {
    loudness: articulations.includes( "accent" ) ? 1.5 : 1,
    slide: event.fall ? "fall" : event.rise ? "rise" : null
  };
}

function pitchMatches( a, b ) {
  return a.letter === b.letter
      && a.octave === b.octave
      && a.alter === b.alter;
}

function hasPitch( event, pitch ) {
  return event.pitches.some( p => pitchMatches( p, pitch ) );
}

function tiedDurationOf( staff, index, pitch ) {
  let total = lengthOf( staff.events[ index ] );
  let i = index;

  while ( staff.events[ i ].tie
       && i + 1 < staff.events.length
       && hasPitch( staff.events[ i + 1 ], pitch )
  ) {
    total += lengthOf( staff.events[ i + 1 ] );
    i++;
  }
  return total;
}

function isContinuing( staff, index, pitch ) {
  if ( !index )
    return false;
  const previous = staff.events[ index - 1 ];
  return previous.tie && hasPitch( previous, pitch );
}

function highlight( event, is_on ) {
  const marks = [
    ...( event.marks || [] ),
    ...( event.textMarks || [] )
  ];
  for ( let i = 0; i < marks.length; i++ )
    marks[ i ].classList.toggle( "playing", is_on );
  if ( !is_on )
    return;
  followInEditor( event );
}

function unhighlightEvent( event ) {
  highlight( event, false );
}

function swingRatio() {
  return Math.min( SWING_AMOUNT, MOST_SWING );
}

function isSwung() {
  return SWING_AMOUNT > 0.5
      && !isCompoundMeter( SHEET.meter );
}

function swungTimeOf( position ) {
  if ( !isSwung() )
    return position;
  const beat = 1 / 4;
  const beat_start = Math.floor( position / beat + EPSILON ) * beat;
  const within = ( position - beat_start ) / beat;
  const performed = within <= 0.5
    ? within * 2 * swingRatio()
    : swingRatio() + ( within - 0.5 ) * 2 * ( 1 - swingRatio() );
  return beat_start + performed * beat;
}

function straightTimeOf( performed_position ) {
  if ( !isSwung() )
    return performed_position;
  const beat = 1 / 4;
  const beat_start = Math.floor( performed_position / beat + EPSILON ) * beat;
  const within = ( performed_position - beat_start ) / beat;
  const written = within <= swingRatio()
    ? within / ( 2 * swingRatio() )
    : 0.5 + ( within - swingRatio() ) / ( 2 * ( 1 - swingRatio() ) );
  return beat_start + written * beat;
}

function audioTimeAt( position, start_time, from ) {
  const swung_position = swungTimeOf( position );
  const swung_from = swungTimeOf( from );
  const whole_note_seconds = secondsPerWholeNoteOf( SHEET );
  return start_time + ( swung_position - swung_from ) * whole_note_seconds;
}

function scheduleHighlight( event, starts_at, ends_at ) {
  HIGHLIGHT_QUEUE.push({ time: starts_at, event, is_on: true });
  if ( ends_at !== Infinity )
    HIGHLIGHT_QUEUE.push({ time: ends_at, event, is_on: false });
}

function flushHighlights() {
  const now = AUDIO_CONTEXT.currentTime;
  while ( HIGHLIGHT_INDEX < HIGHLIGHT_QUEUE.length
       && HIGHLIGHT_QUEUE[ HIGHLIGHT_INDEX ].time <= now
  ) {
    const entry = HIGHLIGHT_QUEUE[ HIGHLIGHT_INDEX ];
    if ( entry.beat !== undefined )
      showBeat( entry.beat );
    else
      highlight( entry.event, entry.is_on );
    HIGHLIGHT_INDEX++;
  }
  if ( PLAYING )
    HIGHLIGHT_FRAME = requestAnimationFrame( flushHighlights );
}

function scheduleGraces( graces, begins_at, note_seconds, voice ) {
  const grace_seconds = Math.min( 0.06, note_seconds / ( graces.length + 2 ) );
  graces.forEach(
    ( pitch, index ) =>
      scheduleNote(
        pitch,
        begins_at + index * grace_seconds,
        grace_seconds,
        voice
      )
  );
  return graces.length * grace_seconds;
}

function planTimeOf( plan, position ) {
  return audioTimeAt( position, plan.startTime, plan.from );
}

function schedulePitch( pitch, staff, item, plan, grace_delay ) {
  const { event, index, segment } = item;
  const chain_end = Math.min(
    item.start + tiedDurationOf( staff, index, pitch ),
    segment.end
  );
  const sound_end = event.articulations?.includes( "staccato" )
    ? item.start + ( chain_end - item.start ) * 0.5
    : chain_end;
  const performed_start = item.performedAt(
    Math.max( item.start, segment.start )
  );
  const sound_start = Math.max( performed_start, plan.from );
  const performed_sound_end = item.performedAt( sound_end );
  if ( performed_sound_end <= plan.from + EPSILON )
    return;
  const rings_through_hold = plan.stopsForFermata
                          && performed_sound_end >= plan.until - EPSILON;
  const starts_at = planTimeOf( plan, sound_start ) + grace_delay;
  const seconds = rings_through_hold
    ? 60
    : planTimeOf( plan, performed_sound_end ) - starts_at;
  const style = {
    ...soundStyleOf( event ),
    held: rings_through_hold
  };
  const note = scheduleNote(
    pitch,
    starts_at,
    seconds,
    plan.voices.get( staff ),
    style
  );
  if ( rings_through_hold )
    HELD_NOTES.push( note );
}

function scheduleOccurrence( staff, item, plan ) {
  const { event, index, segment } = item;
  const start_in_segment = Math.max( item.start, segment.start );
  const end_in_segment = Math.min( item.end, segment.end );
  const performed_start = item.performedAt( start_in_segment );
  const performed_end = item.performedAt( end_in_segment );
  if ( performed_end <= plan.from + EPSILON
    || performed_start >= plan.until - EPSILON
  ) return;
  const begins_here = item.start >= segment.start - EPSILON
                   && performed_start >= plan.from - EPSILON;
  let grace_delay = 0;
  if ( begins_here && event.graces ) {
    const start_time = planTimeOf( plan, performed_start );
    const end_time = planTimeOf( plan, performed_end );
    grace_delay = scheduleGraces(
      event.graces,
      start_time,
      end_time - start_time,
      plan.voices.get( staff )
    );
  }
  event.pitches.filter(
    pitch => !isContinuing( staff, index, pitch )
          || item.start <= segment.start + EPSILON
  ).forEach(
    pitch => schedulePitch( pitch, staff, item, plan, grace_delay )
  );
  const highlight_end = plan.stopsForFermata
                     && performed_end >= plan.until - EPSILON
    ? Infinity
    : planTimeOf( plan, performed_end );
  const highlight_start = planTimeOf(
    plan,
    Math.max( performed_start, plan.from )
  );
  scheduleHighlight( event, highlight_start, highlight_end );
}

function startTimeOf( item, plan ) {
  const segment_start = Math.max( item.start, item.segment.start );
  const performed_start = item.performedAt( segment_start );
  const audio_start = Math.max( performed_start, plan.from );
  return audioTimeAt( audio_start, plan.startTime, plan.from );
}

function noteQueueOf( plan ) {
  return SHEET.staves.flatMap(
    staff =>
      occurrencesOf( staff, plan.performance ).map(
        item => ({
          item,
          staff,
          startsAt: startTimeOf( item, plan )
        })
      )
  ).sort( ( a, b ) => a.startsAt - b.startsAt );
}

function trimHighlightQueue() {
  if ( !HIGHLIGHT_INDEX )
    return;
  HIGHLIGHT_QUEUE = HIGHLIGHT_QUEUE.slice( HIGHLIGHT_INDEX );
  HIGHLIGHT_INDEX = 0;
}

function scheduleAhead( plan ) {
  trimHighlightQueue();
  const now = AUDIO_CONTEXT.currentTime;
  const horizon = now + (
    document.hidden
      ? HIDDEN_LOOKAHEAD_SECONDS
      : LOOKAHEAD_SECONDS
  );
  while ( plan.next < plan.queue.length
      && plan.queue[ plan.next ].startsAt <= horizon
  ) {
    const { staff, item, startsAt: starts_at } = plan.queue[ plan.next ];
    if ( starts_at >= now - LATE_SECONDS && !staff.muted )
      scheduleOccurrence( staff, item, plan );
    plan.next++;
  }
  plan.metronome( horizon );
  HIGHLIGHT_QUEUE.sort( ( a, b ) => a.time - b.time );
}

document.addEventListener( "visibilitychange",
  () => {
    if ( !PLAYING || !ACTIVE_PLAN )
      return;
    scheduleAhead( ACTIVE_PLAN );
  }
);

function currentPosition() {
  if ( !PLAYING )
    return PLAYBACK_POSITION;
  const seconds_played = Math.max(
    0, AUDIO_CONTEXT.currentTime - PLAYBACK_ORIGIN.time
  );
  const started_at = swungTimeOf( PLAYBACK_ORIGIN.position );
  const position = straightTimeOf(
    started_at + seconds_played / secondsPerWholeNoteOf( SHEET )
  );
  return Math.min( position, PLAYBACK_ORIGIN.until );
}

function voicesOf( mix ) {
  return new Map(
    SHEET.staves.map(
      staff => [
        staff,
        buildVoice(
          mix,
          staff.instrument
        )
      ]
    )
  );
}

function startPlayback() {
  const performance = performanceOf( SHEET );
  const song_length = totalDurationOf( SHEET );
  if ( PLAYBACK_POSITION >= song_length - EPSILON )
    PLAYBACK_POSITION = 0;
  PLAYING = true;
  PLAY_BUTTON.classList.add( "pausable" );
  PLAY_BUTTON.classList.remove( "holding" );
  AUDIO_CONTEXT = new AudioContext();
  AUDIO_MIX = buildMix( AUDIO_CONTEXT );
  const voices = voicesOf( AUDIO_MIX );
  const start_time = AUDIO_CONTEXT.currentTime + 0.05;
  const fermata_at = nextFermataAfter( PLAYBACK_POSITION, performance );
  const until = Math.min( fermata_at, song_length );
  const stops_for_fermata = fermata_at <= song_length + EPSILON;
  const plan = {
    stopsForFermata: stops_for_fermata,
    from: PLAYBACK_POSITION,
    songLength: song_length,
    startTime: start_time,
    performance,
    voices,
    until
  };
  PLAYBACK_ORIGIN = {
    position: PLAYBACK_POSITION,
    time: start_time,
    until
  };

  plan.metronome = metronomeOf(
    start_time,
    AUDIO_MIX.compressor,
    PLAYBACK_POSITION,
    until
  );
  plan.queue = noteQueueOf( plan );
  plan.next = 0;
  ACTIVE_PLAN = plan;
  HIGHLIGHT_QUEUE = [];
  HIGHLIGHT_INDEX = 0;
  scheduleAhead( plan );
  SCHEDULER_TIMER = setInterval( () => scheduleAhead( plan ), 500 );
  startPlayhead();

  HIGHLIGHT_FRAME = requestAnimationFrame( flushHighlights );

  const seconds_left = audioTimeAt( until, 0, PLAYBACK_POSITION );
  const hold = () => holdFermata( until );
  const finish = stops_for_fermata ? hold : finishPlayback;
  const extra = stops_for_fermata ? 0 : 0.1;
  const delay = ( seconds_left + extra ) * 1000;
  PLAYBACK_TIMEOUT = setTimeout( finish, delay );
}

function holdFermata( position ) {
  PLAYING = false;
  HOLDING = true;
  PLAYBACK_POSITION = position;
  PLAY_BUTTON.classList.remove( "pausable" );
  PLAY_BUTTON.classList.add( "holding" );
  showPosition( position );
  placePlayhead( position );
}

function continueAfterFermata() {
  const held_context = AUDIO_CONTEXT;
  clearInterval( SCHEDULER_TIMER );
  clearTimeout( PLAYBACK_TIMEOUT );
  HELD_NOTES.forEach( note => note.letGo() );
  HELD_NOTES = [];
  SHEET.staves.forEach( staff => staff.events.forEach( unhighlightEvent ) );
  setTimeout( () => held_context.close(), 400 );
  AUDIO_CONTEXT = null;
  HOLDING = false;
  if ( PLAYBACK_POSITION >= totalDurationOf( SHEET ) - EPSILON )
    finishPlayback();
  else
    startPlayback();
}

function pausePlayback() {
  PLAYBACK_POSITION = currentPosition();
  stopPlayback();
  showPosition( PLAYBACK_POSITION );
  placePlayhead( PLAYBACK_POSITION );
}

function finishPlayback() {
  stopPlayback();
  PLAYBACK_POSITION = 0;
  showPosition( 0 );
}

function stopPlayback() {
  PLAYING = false;
  HOLDING = false;
  HELD_NOTES = [];
  PLAY_BUTTON.classList.remove( "pausable" );
  PLAY_BUTTON.classList.remove( "holding" );

  clearInterval( SCHEDULER_TIMER );
  clearTimeout( PLAYBACK_TIMEOUT );
  if ( HIGHLIGHT_FRAME ) {
    cancelAnimationFrame( HIGHLIGHT_FRAME );
    HIGHLIGHT_FRAME = null;
  }
  HIGHLIGHT_QUEUE = [];
  HIGHLIGHT_INDEX = 0;
  SHEET.staves.forEach( staff => staff.events.forEach( unhighlightEvent ) );
  resetMetronome();
  stopPlayhead();

  if ( AUDIO_CONTEXT ) {
    fadeOutAndClose( AUDIO_CONTEXT, AUDIO_MIX );
    AUDIO_CONTEXT = null;
    AUDIO_MIX = null;
  }
}

function fadeOutAndClose( context, mix ) {
  mix.master.gain.setTargetAtTime( 0, context.currentTime, 0.015 );
  setTimeout( () => context.close(), 150 );
}

PLAY_BUTTON.addEventListener( "click",
  () => {
    if ( HOLDING )
      continueAfterFermata();
    else if ( PLAYING )
      pausePlayback();
    else
      startPlayback();
  }
);

function spaceTogglesPlayback( target ) {
  const typing = [ "SELECT", "TEXTAREA" ].includes( target.tagName );
  return OUTPUT.contains( target )
      && !SOUND_PANEL.contains( target )
      && !typing;
}

document.addEventListener( "keydown",
  event => {
    if ( event.code !== "Space"
      || !spaceTogglesPlayback( document.activeElement )
    ) return;
    event.preventDefault();
    PLAY_BUTTON.click();
  }
);

