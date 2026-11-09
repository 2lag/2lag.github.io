const MINOR_KEY_FIFTHS = {
  am: 0,
  em: 1,
  bm: 2,
  fsm: 3,
  csm: 4,
  gsm: 5,
  dsm: 6,
  asm: 7,
  dm: -1,
  gm: -2,
  cm: -3,
  fm: -4,
  bbm: -5,
  ebm: -6,
  abm: -7
};
const MAJOR_KEY_FIFTHS = {
  c: 0,
  g: 1,
  d: 2,
  a: 3,
  e: 4,
  b: 5,
  fs: 6,
  cs: 7,
  f: -1,
  bb: -2,
  eb: -3,
  ab: -4,
  db: -5,
  gb: -6,
  cb: -7
};
const NOTE_MARKS = {
  "~": "tie",
  "-": "slur",
  "*": "staccato",
  ">": "accent",
  "_": "tenuto",
  "^": "fermata",
  "\\": "fall",
  "/": "rise"
};
const DYNAMIC_LEVELS = {
  pp: 0.3,
  p: 0.45,
  mp: 0.6,
  mf: 0.78,
  f: 1,
  ff: 1.25
};
const TOKEN_PATTERN =
  /\(|\)[^\s()]*|\{[^}]*\}?[^\s()]*|\[[^\]]*\]?[^\s()]*|[^\s()]+/g;
const LETTER_SEMITONES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const CLEF_TYPES = { t: "treble", b: "bass", a: "alto", tn: "tenor" };
const ARTICULATIONS = [ "staccato", "accent", "tenuto", "fermata" ];
const DYNAMIC_STEPS = [ "pp", "p", "mp", "mf", "f", "ff" ];
const MEASURE_NUMBERING = [ "all", "lines", "none" ];
const NOTE_VALUES = [ 1, 2, 4, 8, 16, 32, 64 ];
const SILENT = { report: () => null };
const SHARP_ORDER = "fcgdaeb";
const FLAT_ORDER = "beadgcf";
const MOST_COPIES = 999;
const EPSILON = 1e-6;

const BARLINE_SETTINGS = {
  key: {
    read: keyFifthsOf,
    wrong: "unknown key"
  },
  break: {
    read: oneOf( "line", "page" ),
    wrong: "break is line or page"
  },
  bar: {
    read: oneOf( "double", "final" ),
    wrong: "bar is double or final"
  },
  mark: {
    read: value => value.length <= 16 ? value : null,
    wrong: "a mark is 16 characters at most"
  }
};

function oneOf( ...choices ) {
  return value => choices.includes( value ) ? value : null;
}

function writtenLengthOf( event ) {
  return ( 1 / event.duration ) * ( 2 - Math.pow( 0.5, event.dots ) );
}

function lengthOf( event ) {
  return writtenLengthOf( event ) * ( event.tupletRatio ?? 1 );
}

function midiOf( pitch ) {
  const base = ( pitch.octave + 1 ) * 12;
  return base + LETTER_SEMITONES[ pitch.letter ] + pitch.alter;
}

function measureLengthOf( meter ) {
  return meter.beats / meter.unit;
}

function keyFifthsOf( name ) {
  if ( Object.hasOwn( MAJOR_KEY_FIFTHS, name ) )
    return MAJOR_KEY_FIFTHS[ name ];
  if ( Object.hasOwn( MINOR_KEY_FIFTHS, name ) )
    return MINOR_KEY_FIFTHS[ name ];
  return null;
}

function keyAlterOf( letter, fifths ) {
  if ( fifths > 0 && SHARP_ORDER.indexOf( letter ) < fifths )
    return 1;
  if ( fifths < 0 && FLAT_ORDER.indexOf( letter ) < -fifths )
    return -1;
  return 0;
}

function parsePitch( text ) {
  const match = text.match( /^([0-8])([a-g])(ss|bb|s|b|n)?$/ );
  if ( !match )
    return null;
  const alter = { ss: 2, s: 1, n: 0, b: -1, bb: -2 }[ match[ 3 ] ] ?? null;
  return { letter: match[ 2 ], alter, octave: Number( match[ 1 ] ) };
}

function applyKeyToNotes( staves, key_changes ) {
  staves.forEach(
    staff => {
      let position = 0;
      let change = 0;
      staff.events.forEach(
        event => {
          while ( key_changes[ change + 1 ]?.position <= position + EPSILON )
            ++change;
          const fifths = key_changes[ change ].fifths;
          const pitches = [
            ...event.pitches,
            ...( event.graces || [] )
          ];
          for ( let i = 0; i < pitches.length; ++i )
            pitches[ i ].alter ??= keyAlterOf( pitches[ i ].letter, fifths );
          event.pitches.sort( ( a, b ) => midiOf( a ) - midiOf( b ) );
          position += lengthOf( event );
        }
      );
    }
  );
}

function isRequestOnBarline( request, measure_length ) {
  if ( isOnBarline( request.position, measure_length ) )
    return true;
  request.problem( `${ request.name }= goes on a barline, between measures` );
  return false;
}

function barlineSettingsOf( requests, measure_length ) {
  const settings = { key: [], break: [], bar: [], mark: [] };
  requests.filter(
    request =>
      isRequestOnBarline( request, measure_length )
  ).sort(
    ( a, b ) => a.position - b.position
  ).forEach(
    ({ name, value, position }) => {
      const list = settings[ name ];
      const last = list.at( -1 );
      if ( last && Math.abs( last.position - position ) < EPSILON )
        list.pop();
      list.push({ position, value });
    }
  );
  return settings;
}

function keyChangesOf( requests ) {
  const changes = [{ position: 0, fifths: 0 }];
  requests.forEach(
    ({ position, value }) => {
      if ( changes.at( -1 ).position === position )
        changes.pop();
      if ( changes.at( -1 )?.fifths !== value )
        changes.push({ position, fifths: value });
    }
  );
  return changes;
}

function nextLetterAfter( text ) {
  return /^[A-Y]$/.test( text )
    ? String.fromCharCode( text.charCodeAt( 0 ) + 1 )
    : "A";
}

function rehearsalMarksOf( requests ) {
  let previous = "";
  return requests.map(
    ({ position, value }) => {
      previous = value || nextLetterAfter( previous );
      return { position, text: previous };
    }
  );
}

function parseLength( text ) {
  const match = text.match( /^(\d+)(\.{0,2})([~\-*>_^\\/]*)$/ );
  if ( !match || !NOTE_VALUES.includes( Number( match[ 1 ] ) ) )
    return null;
  const marks = [ ...match[ 3 ] ].map( mark => NOTE_MARKS[ mark ] );
  const length = {
    duration: Number( match[ 1 ] ),
    tie: marks.includes( "tie" ),
    dots: match[ 2 ].length
  };
  const articulations = ARTICULATIONS.filter(
    articulation => marks.includes( articulation )
  );
  if ( marks.includes( "slur" ) )
    length.slur = true;
  if ( marks.includes( "fall" ) )
    length.fall = true;
  if ( marks.includes( "rise" ) )
    length.rise = true;
  if ( articulations.length )
    length.articulations = articulations;
  return length;
}

function parseRest( text ) {
  const length = text.startsWith( "r" )
    ? parseLength( text.slice( 1 ) )
    : null;
  const only_fermata = length
                    && ( length.articulations || [] ).every(
                         articulation =>
                           articulation === "fermata"
                       );
  if ( !length
    || length.tie
    || length.slur
    || length.fall
    || length.rise
    || !only_fermata
  ) return null;
  return {
    rest: true,
    pitches: [],
    ...length
  };
}

function parseNote( text ) {
  const match = text.match( /^([0-8][a-g](?:ss|bb|s|b|n)?)(\d.*)$/ );
  const length = match && parseLength( match[ 2 ] );
  const pitch = match && parsePitch( match[ 1 ] );
  if ( !pitch || !length )
    return null;
  return {
    rest: false,
    pitches: [ pitch ],
    ...length
  };
}

function parseChord( text, column, report ) {
  const closing = text.indexOf( "]" );
  if ( closing === -1 )
    return report( column, text, "chord is missing ]" );
  const pitches = [];
  for ( const piece of text.slice( 1, closing ).matchAll( /\S+/g ) ) {
    const pitch = parsePitch( piece[ 0 ] );
    if ( pitch )
      pitches.push( pitch );
    else
      report( column + 1 + piece.index, piece[ 0 ], "unknown note in chord" );
  }
  if ( !pitches.length )
    return report( column, text, "empty chord" );
  const length = parseLength( text.slice( closing + 1 ) );
  if ( !length ) {
    return report(
      column + closing + 1,
      text.slice( closing + 1 ) || "]",
      "chord needs a duration like ]4"
    );
  }
  return {
    rest: false,
    pitches,
    ...length
  };
}

function parseGrace( text ) {
  return text.startsWith( "g" )
    ? parsePitch( text.slice( 1 ) )
    : null;
}

function attachGraces( event, staff, report ) {
  if ( !staff.waitingGraces.length )
    return;
  if ( event.rest )
    staff.waitingGraces.forEach(
      grace =>
        report(
          grace.line,
          grace.column,
          grace.token,
          "a grace note needs a note after it, not a rest"
        )
    );
  else {
    event.graces = staff.waitingGraces.map( grace => grace.pitch );
    event.graceSources = staff.waitingGraces;
  }
  staff.waitingGraces = [];
}

function parseDynamic( text ) {
  if ( Object.hasOwn( DYNAMIC_LEVELS, text )
    || text === "sfz"
  ) return { level: text };
  const hairpin = text.match( /^([<>])(\d+(?:\.\d+)?)?$/ );
  if ( !hairpin )
    return null;
  const beats = hairpin[ 2 ] ? Number( hairpin[ 2 ] ) : null;
  if ( beats === 0 )
    return null;
  return {
    hairpin: hairpin[ 1 ],
    beats
  };
}

function isLevelMark( event ) {
  return Object.hasOwn( DYNAMIC_LEVELS, event.dynamic?.level ?? "" );
}

function steppedLevel( level, hairpin ) {
  const levels = DYNAMIC_STEPS.map( name => DYNAMIC_LEVELS[ name ] );
  const nearest = levels.reduce(
    ( best, value, idx ) =>
      Math.abs( value - level ) < Math.abs( levels[ best ] - level )
        ? idx
        : best,
    0
  );
  const step = hairpin === "<" ? 1 : -1;
  return levels[
    Math.min(
      levels.length - 1,
      Math.max( 0, nearest + step )
    )
  ];
}

function rampBetween( from, to, start, end ) {
  const slope = end > start
    ? ( to - from ) / ( end - start )
    : 0;
  return {
    from, to,
    start, end,
    slope
  };
}

function rampOf( events, starts, idx, level, staff_end, beat_length ) {
  const start = starts[ idx ];
  const { hairpin, beats } = events[ idx ].dynamic;
  const next = events.findIndex(
    ( event, later ) => later > idx
                     && isLevelMark( event )
  );
  if ( !beats && next !== -1 ) {
    const to = DYNAMIC_LEVELS[ events[ next ].dynamic.level ];
    return rampBetween( level, to, start, starts[ next ] );
  }
  const end = beats
    ? Math.min( staff_end, start + beats * beat_length )
    : staff_end;
  return rampBetween( level, steppedLevel( level, hairpin ), start, end );
}

function applyDynamics( staff, beat_length ) {
  staff.hairpins = [];
  if ( !staff.events.some( event => event.dynamic ) )
    return;
  const starts = [];
  let staff_end = 0;
  staff.events.forEach(
    event => {
      starts.push( staff_end );
      staff_end += lengthOf( event );
    }
  );
  let level = 1;
  let ramp = null;
  staff.events.forEach(
    ( event, idx ) => {
      const start = starts[ idx ];
      if ( ramp && start >= ramp.end - EPSILON ) {
        level = ramp.to;
        ramp = null;
      }
      if ( isLevelMark( event ) ) {
        level = DYNAMIC_LEVELS[ event.dynamic.level ];
        ramp = null;
      }
      if ( event.dynamic?.hairpin ) {
        ramp = rampOf(
          staff.events, starts, idx,
          level, staff_end, beat_length
        );
        staff.hairpins.push({ kind: event.dynamic.hairpin, ...ramp });
      }
      const current = ramp
        ? ramp.from + ramp.slope * ( start - ramp.start )
        : level;
      event.loudness = event.dynamic?.level === "sfz"
        ? current * 1.5
        : current;
    }
  );
}

function parseWithDynamic( token, column, line_number, staff, report ) {
  const colon = token.indexOf( ":" );
  const dynamic = parseDynamic( token.slice( colon + 1 ) );
  if ( !dynamic ) {
    return report(
      line_number,
      column + colon,
      token.slice( colon ),
      "dynamics are :pp :p :mp :mf :f :ff :sfz, or :< :> for a hairpin"
    );
  }
  const body = token.slice( 0, colon );
  if ( parseGrace( body ) ) {
    return report(
      line_number,
      column + colon,
      token.slice( colon ),
      "dynamics go on the main note, not a grace note"
    );
  }
  const event = parseEvent(
    body, column, line_number,
    staff, report
  );
  return event && {
    ...event,
    token,
    dynamic
  };
}

function parseEvent( token, column, line_number, staff, report ) {
  if ( token.includes( ":" ) )
    return parseWithDynamic( token, column, line_number, staff, report );
  const grace = parseGrace( token );
  if ( grace ) {
    staff.waitingGraces.push({
      line: line_number,
      pitch: grace,
      column,
      token
    });
    return null;
  }
  const reportHere = ( where, what, reason ) =>
    report( line_number, where, what, reason );
  if ( token.startsWith( "[" ) ) {
    return withSourceOf(
      parseChord( token, column, reportHere ),
      column,
      token
    );
  }
  return withSourceOf(
    parseRest( token ) || parseNote( token ),
    column,
    token
  ) ||
  reportHere(
    column,
    token,
    "not a note, rest, chord or grace note"
  );
}

function withSourceOf( event, column, token ) {
  return event && { ...event, column, token };
}

function withGracesAttached( event, staff, report ) {
  if ( event )
    attachGraces( event, staff, report );
  return event;
}

function largestPowerOfTwoBelow( count ) {
  return Math.pow( 2, Math.floor( Math.log2( count ) ) );
}

function parseTuplet( token, column, line_number, staff, report ) {
  if ( !token.endsWith( "}" ) )
    return report( line_number, column, token, "triplet is missing }" );
  const events = [
    ...token.slice( 1, -1 ).matchAll( /\[[^\]]*\]?\S*|\S+/g )
  ].map(
    piece =>
      withGracesAttached(
        parseEvent(
          piece[ 0 ],
          column + 1 + piece.index,
          line_number,
          staff,
          report
        ),
        staff,
        report
      )
  ).filter( Boolean );
  if ( !events.length )
    return report( line_number, column, token, "empty triplet" );
  const shortest = Math.min( ...events.map( writtenLengthOf ) );
  const count = Math.round(
    events.reduce(
      ( total, event ) =>
        total + writtenLengthOf( event ),
      0
    ) / shortest
  );
  const normal = largestPowerOfTwoBelow( count );
  if ( count === normal ) {
    const reason =
      "these already fit evenly; a tuplet needs a count "
      + `like 3 or 5 (this is ${ count })`;
    return report( line_number, column, token, reason );
  }
  const tuplet = { count, normal };
  staff.tuplets.push({
    length: events.reduce(
      ( total, event ) =>
        total + writtenLengthOf( event ),
      0
    ) * normal / count,
    start: staff.position,
    line: line_number,
    column,
    token
  });
  return events.map(
    event => ({
      ...event,
      tuplet,
      tupletRatio: normal / count
    })
  );
}

function repeatSignOf( token, staff ) {
  if ( token === "|" ) {
    ++staff.openRepeats;
    return {
      kind: "start",
      level: staff.openRepeats
    };
  }
  const level = Math.max( 1, staff.openRepeats );
  staff.openRepeats = Math.max( 0, staff.openRepeats - 1 );
  return { kind: "end", level };
}

function addEvent( event, line_number, staff, pass ) {
  attachGraces( event, staff, pass.report );
  const copy = pass.countSource
    ? { countSource: pass.countSource }
    : {};
  staff.events.push({
    ...event,
    line: line_number,
    ...copy
  });
  staff.position += lengthOf( event );
}

function playToken( { token, column, line }, staff, pass ) {
  if ( /^\|{5,}$/.test( token ) ) {
    return pass.report(
      line,
      column,
      token,
      "| and || repeat, ||| and |||| loop forever; there's nothing longer"
    );
  }
  if ( token === "|||" || token === "||||" ) {
    staff.loops.push({
      kind: token === "|||"
        ? "start"
        : "end",
      position: staff.position,
      column,
      token,
      line
    });
    return;
  }
  if ( /^\|+$/.test( token ) ) {
    staff.repeats.push({
      ...repeatSignOf( token, staff ),
      position: staff.position,
      column,
      token,
      line
    });
    return;
  }
  if ( /^x\d*$/.test( token ) ) {
    return pass.report(
      line,
      column,
      token,
      "x2 goes right after what it repeats, with no space"
    );
  }
  const events = token.startsWith( "{" )
    ? parseTuplet( token, column, line, staff, pass.report )
    : [ parseEvent( token, column, line, staff, pass.report ) ];
  const kept = ( events || [] ).filter( Boolean );
  for ( let i = 0; i < kept.length; ++i )
    addEvent( kept[ i ], line, staff, pass );
}

function playTimes( times, count_source, pass, play_once ) {
  if ( times < 2 ) {
    pass.report(
      count_source.line,
      count_source.column,
      count_source.token,
      "repeat at least twice, like x2"
    );
  }
  if ( times > MOST_COPIES ) {
    const reason =
      `that's a lot; x${ MOST_COPIES } at most, `
      + "or use ||| |||| to loop forever";
    pass.report(
      count_source.line,
      count_source.column,
      count_source.token,
      reason
    );
    times = 1;
  }
  for ( let copy = 0; copy < Math.max( 1, times ); ++copy ) {
    play_once(
      !copy
        ? pass
        : {
            ...SILENT,
            countSource: pass.countSource || count_source
          },
      copy
    );
  }
}

function playCounted( record, staff, pass ) {
  const counted = record.token.match( /^(.+?)(x(\d+))$/ );
  if ( !counted )
    return playToken( record, staff, pass );
  const [ , written, countToken, times ] = counted;
  const count_source = {
    line: record.line,
    token: countToken,
    column: record.column + written.length,
  };
  const graces = [ ...staff.waitingGraces ];
  playTimes(
    Number( times ),
    count_source,
    pass,
    ( copy_pass, copy ) => {
      if ( copy > 0 )
        staff.waitingGraces = [ ...graces ];
      playToken(
        {
          ...record,
          token: written
        },
        staff,
        copy_pass
      );
    }
  );
}

function playGroup( records, staff, pass ) {
  const closing = records.at( -1 );
  const counted = closing.token.match( /^\)x(\d+)$/ );
  const inside = records.slice( 1, -1 );
  if ( !counted ) {
    pass.report(
      closing.line,
      closing.column,
      closing.token,
      "a group needs a count right after it, like )x2"
    );
    return playRecords( inside, staff, pass );
  }
  const count_source = {
    line: closing.line,
    column: closing.column + 1,
    token: closing.token.slice( 1 )
  };
  playTimes(
    Number( counted[ 1 ] ),
    count_source,
    pass,
    copy_pass => playRecords( inside, staff, copy_pass )
  );
}

function feedRecord( group, record, staff, pass ) {
  const opens = record.token === "(";
  const closes = record.token.startsWith( ")" );
  if ( group.depth > 0 ) {
    group.depth += opens ? 1 : closes ? -1 : 0;
    group.records.push( record );
    if ( !group.depth )
      playGroup( group.records.splice( 0 ), staff, pass );
    return;
  }
  if ( opens ) {
    group.depth = 1;
    group.records = [ record ];
    return;
  }
  if ( closes ) {
    return pass.report(
      record.line,
      record.column,
      record.token,
      "there's no ( for this ) to close"
    );
  }
  playCounted( record, staff, pass );
}

function playRecords( records, staff, pass ) {
  const group = { depth: 0, records: [] };
  records.forEach(
    record => feedRecord( group, record, staff, pass )
  );
}

function parseMusicLine( line_text, line_number, staff, report ) {
  TOKEN_PATTERN.lastIndex = 0;
  for ( const match of line_text.matchAll( TOKEN_PATTERN ) ) {
    feedRecord(
      staff.group,
      {
        token: match[ 0 ],
        column: match.index,
        line: line_number
      },
      staff,
      { report }
    );
  }
}

function isOnBarline( position, measure_length ) {
  const measures = position / measure_length;
  return Math.abs( measures - Math.round( measures ) ) < EPSILON;
}

function sharesAPitch( event, next ) {
  return !event.rest
      && !next.rest
      && event.pitches.some(
           pitch =>
             next.pitches.some(
               other => other.letter === pitch.letter
                     && other.octave === pitch.octave
             )
         );
}

function reportOpenMarks( staff, report ) {
  if ( staff.group.depth > 0 ) {
    const [ opening, ...inside ] = staff.group.records;
    report(
      opening.line,
      opening.column,
      opening.token,
      "this ( is never closed; end it with )x2"
    );
    playRecords( inside, staff, { report } );
  }
  staff.waitingGraces.forEach(
    grace =>
      report(
        grace.line,
        grace.column,
        grace.token,
        "a grace note needs a note after it"
      )
  );
}

function reportMisplacedMarks( staff, measure_length, report ) {
  [
    ...staff.repeats,
    ...staff.loops
  ].filter( sign => !isOnBarline( sign.position, measure_length ) )
   .forEach(
     sign =>
       report(
         sign.line,
         sign.column,
         sign.token,
         "repeat signs go on a barline, between measures"
       )
   );
  staff.events.filter(
    ( event, idx ) => event.tie
                     && !event.countSource
                     && staff.events[ idx + 1 ]
                     && !sharesAPitch( event, staff.events[ idx + 1 ] )
  ).forEach(
    event =>
      report(
        event.line,
        event.column,
        event.token,
        "a tie (~) joins two of the same note; "
        + "for different notes use a slur (-)"
      )
  );
  staff.tuplets.filter(
    span => {
      const end = span.start + span.length;
      const first_bar = Math.floor( span.start / measure_length + EPSILON );
      const last_bar = Math.floor( end / measure_length - EPSILON );
      return first_bar !== last_bar;
    }
  ).forEach(
    span =>
      report(
        span.line,
        span.column,
        span.token,
        "a triplet can't cross a barline"
      )
  );
}

function finishStaff( staff, measure_length, report ) {
  reportOpenMarks( staff, report );
  reportMisplacedMarks( staff, measure_length, report );
  staff.loopSigns = staff.loops.filter(
    sign =>
      isOnBarline( sign.position, measure_length )
  );
  const repeats = staff.repeats.filter(
    sign =>
      isOnBarline(
        sign.position,
        measure_length
      )
  ).map( ({ kind, level, position }) => ({ kind, level, position }) );
  [
    "waitingGraces",
    "position",
    "repeats",
    "loops",
    "openRepeats",
    "tuplets",
    "group"
  ].forEach( name => delete staff[ name ] );
  return repeats;
}

function loopOf( staves, report ) {
  const signs = staves.flatMap( staff => staff.loopSigns );
  staves.forEach( staff => delete staff.loopSigns );
  const at = kind => [
    ...new Map(
      signs.filter( sign => sign.kind === kind )
           .map( sign => [ sign.position.toFixed( 6 ), sign ] )
    ).values()
  ];
  const [ starts, ends ] = [ at( "start" ), at( "end" ) ];
  [ ...starts.slice( 1 ), ...ends.slice( 1 ) ].forEach(
    sign =>
      report(
        sign.line,
        sign.column,
        sign.token,
        "a sheet can only have one endless loop"
      )
  );
  if ( !ends.length ) {
    starts.forEach(
      sign =>
        report(
          sign.line,
          sign.column,
          sign.token,
          "this loop never closes; end it with ||||"
        )
    );
    return null;
  }
  const end = ends[ 0 ];
  const start = starts[ 0 ] ? starts[ 0 ].position : 0;
  if ( end.position <= start + EPSILON ) {
    return report(
      end.line,
      end.column,
      end.token,
      "a loop needs music between ||| and ||||"
    );
  }
  return { start, end: end.position };
}

function mergedRepeatsOf( repeats_of_each_staff ) {
  const unique = new Map(
    repeats_of_each_staff.flat().map(
      sign => [
        `${ sign.kind } ${ sign.level } ${ sign.position.toFixed( 6 ) }`,
        sign
      ]
    )
  );
  return [ ...unique.values() ].sort( ( a, b ) => a.position - b.position );
}

function applySetting( name, value, sheet, problem ) {
  if ( name === "title" || name === "author" ) {
    sheet[ name ] = value;
    return;
  }
  if ( name === "bpm" ) {
    const bpm = Number( value );
    if ( Number.isInteger( bpm ) && bpm > 0 )
      sheet.bpm = bpm;
    else
      problem( "bpm must be a whole number above 0" );
    return;
  }
  if ( name === "ts" ) {
    const [ beats, unit ] = value.split( "," ).map( Number );
    if ( Number.isInteger( beats )
      && beats > 0
      && NOTE_VALUES.includes( unit )
    ) sheet.meter = { beats, unit };
    else problem( "time signature looks like 4,4 or 6,8" );
    return;
  }
  if ( name === "numbers" ) {
    if ( MEASURE_NUMBERING.includes( value ) )
      sheet.numbers = value;
    else
      problem( "numbers is all, lines or none" );
    return;
  }
  problem( "unknown setting", true );
}

function placeOnBarline( name, value, sheet, staff, problem ) {
  const setting = BARLINE_SETTINGS[ name ];
  const read = setting.read( value );
  if ( read === null )
    return problem( setting.wrong );
  if ( staff.group.depth > 0 )
    return problem( `${ name }= can't go inside a ( )x2 group` );
  sheet.barlineRequests.push({
    name,
    value: read,
    position: staff.position,
    problem
  });
}

function instrumentNamed( name, problem ) {
  if ( Object.hasOwn( SOUND_PRESETS, name ) )
    return name;
  return problem(
    `unknown instrument; try ${ Object.keys( SOUND_PRESETS ).join( ", " ) }`
  );
}

function parseSheet( text ) {
  const sheet = makeSheet();
  const staves = new Map();
  const report = ( line, column, token, reason ) => {
    sheet.problems.push({ line, column, token, reason });
    return null;
  };
  const state = {
    current: null,
    instrument: null
  };
  text.split( "\n" ).forEach(
    ( raw_line, idx ) =>
      parseLine(
        raw_line, idx + 1,
        staves, sheet, state,
        report
      )
  );
  if ( state.instrument )
    state.current.instrument = state.instrument;
  return finalizeStaves( sheet, staves, report );
}

function makeSheet() {
  return {
    bpm: 120,
    title: "",
    loop: null,
    author: "",
    staves: [],
    repeats: [],
    problems: [],
    numbers: "lines",
    key: { fifths: 0 },
    barlineRequests: [],
    meter: { beats: 4, unit: 4 }
  };
}

function makeStaff( clef_type, number ) {
  return {
    number,
    loops: [],
    events: [],
    repeats: [],
    tuplets: [],
    position: 0,
    openRepeats: 0,
    clef: clef_type,
    waitingGraces: [],
    group: { depth: 0, records: [] }
  };
}

function parseClefValue( value ) {
  const match = value.match( /^([tb]|tn|a)(\d+)?$/ );
  if ( !match )
    return null;
  return {
    type: match[ 1 ],
    number: match[ 2 ] ? Number( match[ 2 ] ) : 1
  };
}

function staffKey( type, number ) {
  return `${ type }${ number }`;
}

function findOrCreateStaff( staves, type, number ) {
  const key = staffKey( type, number );
  if ( !staves.has( key ) ) {
    staves.set( key,
      makeStaff( CLEF_TYPES[ type ], number )
    );
  }
  return staves.get( key );
}

function currentStaffOf( staves, state ) {
  state.current ??= findOrCreateStaff( staves, "t", 1 );
  return state.current;
}

function readMusic( line_text, line_number, staves, state, report ) {
  const staff = currentStaffOf( staves, state );
  if ( state.instrument && line_text.trim() ) {
    staff.instrument = state.instrument;
    state.instrument = null;
  }
  parseMusicLine(
    line_text.toLowerCase(),
    line_number, staff, report
  );
}

function parseLine( raw_line, line_number, staves, sheet, state, report ) {
  const line_text = raw_line.split( "#" )[ 0 ];
  const setting = line_text.match( /^(\s*)(\w+)(\s*=\s*)(.*?)\s*$/ );
  if ( !setting ) {
    readMusic( line_text, line_number, staves, state, report );
    return;
  }
  const [ , indent, rawName, equals, rawValue ] = setting;
  const name = rawName.toLowerCase();
  const value = name === "title"
             || name === "author"
             || name === "mark"
    ? rawValue
    : rawValue.toLowerCase();
  const problem = ( reason, is_about_name ) =>
    is_about_name
      ? report( line_number, indent.length, rawName, reason )
      : report(
          line_number,
          indent.length + rawName.length + equals.length,
          rawValue || "=",
          reason
        );
  if ( name === "instrument" ) {
    state.instrument = instrumentNamed(
      value.replace( /\s+/g, " " ),
      problem
    ) ?? state.instrument;
    return;
  }
  if ( Object.hasOwn( BARLINE_SETTINGS, name ) ) {
    placeOnBarline(
      name, value, sheet,
      currentStaffOf( staves, state ),
      problem
    );
    return;
  }
  if ( name !== "clef"
    && name !== "mclef"
  ) {
    applySetting( name, value, sheet, problem );
    return;
  }
  const clef = parseClefValue( value );
  if ( !clef ) {
    problem( "clef is t, b, a or tn, with an optional number: clef=t2" );
    return;
  }
  state.current = findOrCreateStaff( staves, clef.type, clef.number );
  if ( name === "mclef" )
    state.current.muted = true;
}

function finalizeStaves( sheet, staves, report ) {
  const measure_length = measureLengthOf( sheet.meter );
  const all_staves = [ ...staves.values() ];
  sheet.repeats = mergedRepeatsOf(
    all_staves.map(
      staff =>
        finishStaff( staff, measure_length, report )
    )
  );
  sheet.loop = loopOf( all_staves, report );
  const settings = barlineSettingsOf(
    sheet.barlineRequests,
    measure_length
  );
  delete sheet.barlineRequests;
  sheet.keyChanges = keyChangesOf( settings.key );
  sheet.key = { fifths: sheet.keyChanges[ 0 ].fifths };
  sheet.breaks = settings.break;
  sheet.barlines = settings.bar;
  sheet.rehearsalMarks = rehearsalMarksOf( settings.mark );
  applyKeyToNotes( all_staves, sheet.keyChanges );
  all_staves.forEach(
    staff =>
      applyDynamics( staff, 1 / sheet.meter.unit )
  );
  const used_staves = all_staves.filter(
    staff => staff.events.length > 0
  );
  if ( !used_staves.length ) {
    const default_staff = findOrCreateStaff( staves, "t", 1 );
    applyDynamics( default_staff, 1 / sheet.meter.unit );
    used_staves.push( default_staff );
  }
  sheet.staves = used_staves;
  return sheet;
}
