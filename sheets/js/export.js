const PLAIN_VELOCITY = 0.75;
const GRACE_LENGTH = 1 / 32;
const SLIDE_SHARE = 0.25;

const STRUDEL_SOUNDS = {
  piano: "piano",
  cello: "gm_cello",
  flute: "gm_flute",
  sax: "gm_alto_sax",
  chiptune: "square",
  violin: "gm_violin",
  trumpet: "gm_trumpet",
  choir: "gm_choir_aahs",
  trombone: "gm_trombone",
  organ: "gm_drawbar_organ",
  "soft pad": "gm_pad_warm",
  harp: "gm_orchestral_harp",
  vibraphone: "gm_vibraphone",
  "music box": "gm_music_box",
  "electric piano": "gm_epiano1",
  strings: "gm_string_ensemble_1",
  guitar: "gm_acoustic_guitar_nylon",
  "upright bass": "gm_acoustic_bass",
  "muted trumpet": "gm_muted_trumpet"
};

function strudelSoundOf( staff ) {
  const name = staff.instrument || SOUND_SETTINGS.preset;
  return STRUDEL_SOUNDS[ name ] || "piano";
}

function strudelNameOf( pitch ) {
  const accidental = {
    "-2": "bb",
    "-1": "b",
    "0": "",
    "1": "#",
    "2": "##"
  }[ pitch.alter ];
  return pitch.letter + accidental + pitch.octave;
}

function strudelChordOf( pitches, semitones = 0 ) {
  const nameOf = pitch =>
    semitones
      ? midiOf( pitch ) + semitones
      : strudelNameOf( pitch );
  const names = pitches.map( nameOf );
  return names.length === 1
    ? String( names[ 0 ] )
    : `[${ names.join( "," ) }]`;
}

function strudelWeightOf( length ) {
  const quarters = Number( ( length * 4 ).toFixed( 4 ) );
  return quarters === 1
    ? ""
    : "@" + quarters;
}

function fermataHoldsOf( performance ) {
  const holds = new Map();
  const is_held = item => item.event.articulations?.includes( "fermata" )
                       && item.end <= item.segment.end + EPSILON;
  SHEET.staves.forEach( staff => {
    const items = occurrencesOf( staff, performance );
    items.filter( is_held ).forEach( item => {
      const at = item.performedAt( item.end ).toFixed( 6 );
      const existing = holds.get( at ) || 0;
      holds.set( at, Math.max( existing, lengthOf( item.event ) ) );
    });
  });
  const to_hold = ( at, extra ) => ({ at: Number( at ), extra });
  return [ ...holds ].map( ([ at, extra ]) => to_hold( at, extra ) );
}

function heldTimeOf( position, holds ) {
  const before = hold => hold.at <= position + EPSILON;
  const add_extra = ( total, hold ) => total + hold.extra;
  return position + holds.filter( before ).reduce( add_extra, 0 );
}

function samePitches( a, b ) {
  return a.map( midiOf ).join() === b.map( midiOf ).join();
}

function soundingStepsOf( staff, performance, holds ) {
  const items = occurrencesOf( staff, performance );
  const steps = [];

  items.forEach( item => {
    const { event, segment } = item;
    const start_of = Math.max( item.start, segment.start );
    const start = heldTimeOf( item.performedAt( start_of ), holds );
    const end_of = Math.min( item.end, segment.end );
    const end = heldTimeOf( item.performedAt( end_of ), holds );
    const step = {
      end,
      event,
      start,
      tie: event.tie,
      lastEvent: event,
      rest: event.rest,
      pitches: event.pitches
    };
    const previous = steps.at( -1 );
    const same_tie = previous
                  && previous.tie
                  && !step.rest
                  && samePitches(
                       previous.pitches,
                       step.pitches
                     );
    if ( !same_tie ) {
      steps.push( step );
      return;
    }
    previous.end = step.end;
    previous.tie = step.tie;
    previous.lastEvent = event;
  });
  return steps;
}

function strudelPiecesOf( step ) {
  const length = step.end - step.start;

  if ( step.rest ) {
    return [{
      velocity: PLAIN_VELOCITY,
      sound: "~",
      length
    }];
  }

  const articulations = step.event.articulations || [];
  const velocity = articulations.includes( "accent" ) ? 1 : PLAIN_VELOCITY;
  const graces = step.event.graces || [];
  const grace_length = Math.min( GRACE_LENGTH, length / ( graces.length + 2 ) );
  const grace_piece = pitch => ({
    sound: strudelNameOf( pitch ),
    length: grace_length,
    velocity: 0.6
  });
  const pieces = graces.map( grace_piece );
  const remaining = length - graces.length * grace_length;
  const slide =
    step.lastEvent.fall
      ? -7
      : step.lastEvent.rise
        ? 7
        : 0;
  const chord = strudelChordOf( step.pitches );
  if ( articulations.includes( "staccato" ) ) {
    const first_half = { sound: chord, length: remaining / 2, velocity };
    const silence = { sound: "~", length: remaining / 2, velocity };
    return [ ...pieces, first_half, silence ];
  }
  if ( slide ) {
    const main_length = remaining * ( 1 - SLIDE_SHARE );
    const main = { sound: chord, length: main_length, velocity };
    const slide_sound = strudelChordOf( step.pitches, slide );
    const slide_length = remaining * SLIDE_SHARE;
    const slide_piece = {
      sound: slide_sound,
      length: slide_length,
      velocity: velocity * 0.6
    };
    return [ ...pieces, main, slide_piece ];
  }
  return [
    ...pieces,
    {
      velocity,
      sound: chord,
      length: remaining
    }
  ];
}

function strudelLineOf( staff, performance, holds, total_length ) {
  const steps = soundingStepsOf( staff, performance, holds );
  const pieces = steps.flatMap( strudelPiecesOf );
  const total_played = pieces.reduce(
    ( total, piece ) => total + piece.length,
    0
  );
  const silence = total_length - total_played;
  if ( silence > EPSILON ) {
    pieces.push({
      sound: "~",
      length: silence,
      velocity: PLAIN_VELOCITY
    });
  }
  const weighted_sound = piece => piece.sound + strudelWeightOf( piece.length );
  const notes = pieces.map( weighted_sound ).join( " " );
  const velocityOf = piece => Number( piece.velocity.toFixed( 2 ) );
  const weighted_velocity = piece =>
    velocityOf( piece ) + strudelWeightOf( piece.length );
  const velocities = pieces.map( weighted_velocity ).join( " " );
  const has_accents = pieces.some( piece => piece.velocity !== PLAIN_VELOCITY );
  const swing_amount = 2 * ( swingRatio() - 0.5 );
  const swing = isSwung()
    ? `.swingBy( ${ Number( swing_amount.toFixed( 3 ) ) }, 4 )`
    : "";
  const velocity_part = has_accents
    ? `.velocity( "[${ velocities }]" )`
    : "";
  const note_part = `note( "[${ notes }]" )`;
  const sound = strudelSoundOf( staff );
  const sound_part = `.s( "${ sound }" )`;
  const slow_part = `.slow( ${ Number( total_length.toFixed( 4 ) ) } )`;
  const parts = [ note_part, velocity_part, sound_part, slow_part, swing ];
  return `  ${ parts.join( "" ) }`;
}

function strudelCodeOf( sheet ) {
  const performance = onePassPerformanceOf( sheet );
  const holds = fermataHoldsOf( performance );
  const pass_length = passLengthOf( sheet );
  const total_length = Math.max( 1, heldTimeOf( pass_length, holds ) );
  const lines = sheet.staves.filter( staff => !staff.muted )
                            .map(
                              staff =>
                                strudelLineOf(
                                  staff,
                                  performance,
                                  holds,
                                  total_length
                                )
                            );
  const header = `setcpm( ${ sheet.bpm }/4 )`;
  if ( !lines.length )
    return `${ header }\nsilence`;
  return [ header, "stack(", lines.join( ",\n" ), ")" ].join( "\n" );
}

EXPORT_STRUDEL.addEventListener( "click",
  () => {
    const code = strudelCodeOf( SHEET );
    copyText( code );
    const encoded = base64Encode( code );
    const url = "https://strudel.cc/#" + encodeURIComponent( encoded );
    window.open( url, "_blank" );
    closeExportMenu();
  }
);

EXPORT_PDF.addEventListener( "click",
  () => {
    closeExportMenu();
    window.print();
  }
);

EXPORT_LINK.addEventListener( "click", async event => {
  event.stopPropagation();
  const link = ( await shareLinkOf( EDITOR.value ) ).href;
  if ( !await copyText( link ) )
    prompt( "copy this link", link );
  EXPORT_LINK.textContent = "link copied ✓";
  setTimeout( () => {
    EXPORT_LINK.textContent = "link";
    closeExportMenu();
  }, 1200 );
});
