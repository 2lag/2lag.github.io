let METRONOME_ON = localStorage.getItem( "metronome" ) === "on";
const TICKING_ICON = METRONOME_ICON;
let CLICK_VOLUME = null;

const CLICKS = {
  beat: { pitch: 1320, loudness: 0.35 },
  downbeat: { pitch: 1760, loudness: 0.6 },
  subdivision: { pitch: 990, loudness: 0.08 }
};

function isCompoundMeter( meter ) {
  return meter.unit >= 8
      && meter.beats % 3 === 0
      && meter.beats > 3;
}

function countedBeatOf( meter ) {
  return isCompoundMeter( meter )
    ? 3 / meter.unit
    : 1 / meter.unit;
}

function scheduleClick( time, kind ) {
  const click = AUDIO_CONTEXT.createOscillator();
  const envelope = AUDIO_CONTEXT.createGain();
  click.frequency.value = CLICKS[ kind ].pitch;
  envelope.gain.setValueAtTime( 0.0001, time );
  envelope.gain.exponentialRampToValueAtTime(
    CLICKS[ kind ].loudness,
    time + 0.002
  );
  envelope.gain.exponentialRampToValueAtTime( 0.0001, time + 0.05 );
  click.connect( envelope );
  envelope.connect( CLICK_VOLUME );
  click.start( time );
  click.stop( time + 0.06 );
}

function showBeat( count ) {
  if ( !METRONOME_ON )
    return;
  METRONOME_BUTTON.textContent = count;
  METRONOME_BUTTON.classList.remove( "beat", "downbeat" );
  void METRONOME_BUTTON.offsetWidth;
  METRONOME_BUTTON.classList.add(
    count === 1
      ? "downbeat"
      : "beat"
  );
}

function resetMetronome() {
  METRONOME_BUTTON.replaceChildren( TICKING_ICON );
  METRONOME_BUTTON.classList.toggle( "on", METRONOME_ON );
}

function metronomeOf( start_time, output, from, until ) {
  CLICK_VOLUME = AUDIO_CONTEXT.createGain();
  CLICK_VOLUME.gain.value = METRONOME_ON ? 1 : 0;
  CLICK_VOLUME.connect( output );
  const beat_length = countedBeatOf( SHEET.meter );
  const measure_length = measureLengthOf( SHEET.meter );
  const beats_per_measure = Math.max(
    1, Math.round( measure_length / beat_length )
  );
  const end = Math.min( until, totalDurationOf( SHEET ) );
  const last_beat = Math.ceil( end / beat_length - EPSILON );
  const audioTimeOf = position => audioTimeAt( position, start_time, from );
  const subdivided = isCompoundMeter( SHEET.meter );
  let beat = Math.floor( from / beat_length + EPSILON );
  const clickBeat = () => {
    const position = beat * beat_length;
    if ( position >= from - EPSILON ) {
      const beat_number = scorePositionOf( position ) / beat_length;
      const count = Math.round( beat_number ) % beats_per_measure + 1;
      const click_time = audioTimeOf( position );
      scheduleClick( click_time, count === 1 ? "downbeat" : "beat" );
      HIGHLIGHT_QUEUE.push({ time: click_time, beat: count });
    }
    if ( subdivided ) {
      [ 1, 2 ]
        .map( step => position + step * beat_length / 3 )
        .filter(
          tick => tick >= from - EPSILON
               && tick < end - EPSILON
        )
        .forEach(
          tick =>
            scheduleClick(
              audioTimeOf( tick ),
              "subdivision"
            )
        );
    }
  };
  return horizon => {
    while ( beat < last_beat
         && audioTimeOf( beat * beat_length ) <= horizon
    ) {
      clickBeat();
      beat++;
    }
  };
}

METRONOME_BUTTON.addEventListener( "click",
  () => {
    METRONOME_ON = !METRONOME_ON;
    localStorage.setItem( "metronome", METRONOME_ON ? "on" : "off" );
    if ( CLICK_VOLUME )
      CLICK_VOLUME.gain.value = METRONOME_ON ? 1 : 0;
    resetMetronome();
  }
);

resetMetronome();
