const REHEARSAL_FACES = `"Century Schoolbook", "TeX Gyre Schola", Georgia`;
const TEXT_RULER = document.createElement( "canvas" ).getContext( "2d" );
const SVG_NS = "http://www.w3.org/2000/svg";
const FERMATA_GLYPH = "\uE4C0";
const KEY_CHANGE_INSET = 0.9;
const GRACE_ADVANCE = 1.3;
const LETTERS = "cdefgab";
const UNTITLED_ROOM = 20;
const PAGE_HEIGHT = 1123;
let PLAYHEAD_STOPS = [];
const GRACE_SIZE = 0.65;
const PAGE_MARGIN = 68;
const PAGE_WIDTH = 794;
const TITLE_ROOM = 90;
const TITLE_GAP = 16;
const SPACE = 7;

const MUSIC_ROOM = PAGE_HEIGHT - 2 * PAGE_MARGIN - TITLE_ROOM - TITLE_GAP;
const TALLEST_SYSTEM = MUSIC_ROOM / STEP;
const SYSTEM_GAP = 7 * SPACE;
const STEP = SPACE / 2;

const GLYPHS = {
  metronomeQuarter: "",
  noteheadWhole: "",
  noteheadBlack: "",
  noteheadHalf: "",
  brace: "",
  bracketTop: "",
  bracketBottom: "",
  dot: ""
};

const ARTICULATION_GLYPHS = {
  staccato: { above: "\uE4A2", below: "\uE4A3" },
  accent: { above: "\uE4A0", below: "\uE4A1" },
  tenuto: { above: "\uE4A4", below: "\uE4A5" }
};

const REST_GLYPHS = {
  1: "",
  2: "",
  4: "",
  8: "",
  16: "",
  32: "",
  64: ""
};

const FLAG_GLYPHS = {
  up: { 8: "", 16: "", 32: "", 64: "" },
  down: { 8: "", 16: "", 32: "", 64: "" }
};

const ACCIDENTAL_GLYPHS = {
  "-2": "\uE264",
  "-1": "\uE260",
  "0": "\uE261",
  "1": "\uE262",
  "2": "\uE263"
};

const DYNAMIC_GLYPHS = {
  p: "\uE520",
  m: "\uE521",
  f: "\uE522",
  s: "\uE524",
  z: "\uE525"
};

const ACCIDENTAL_WIDTHS = {
  "-2": 1.64,
  "-1": 0.9,
  "0": 0.68,
  "1": 1,
  "2": 1
};

const TIME_DIGIT_WIDTHS = [
  1.9,
  1.6,
  1.84,
  1.74,
  1.9,
  1.67,
  1.8,
  1.82,
  1.8,
  1.8
];

const BEAM_COUNTS = {
  8: 1,
  16: 2,
  32: 3,
  64: 4
};

const CLEFS = {
  treble: {
    glyph: "",
    width: 2.7,
    bottomLine: 30,
    glyphStep: 2,
    sharpSteps: [ 8, 5, 9, 6, 3, 7, 4 ],
    flatSteps: [ 4, 7, 3, 6, 2, 5, 1 ]
  },
  bass: {
    glyph: "",
    width: 2.75,
    bottomLine: 18,
    glyphStep: 6,
    sharpSteps: [ 6, 3, 7, 4, 1, 5, 2 ],
    flatSteps: [ 2, 5, 1, 4, 0, 3, -1 ]
  },
  alto: {
    glyph: "\uE05C",
    width: 2.6,
    bottomLine: 24,
    glyphStep: 4,
    sharpSteps: [ 7, 4, 8, 5, 2, 6, 3 ],
    flatSteps: [ 3, 6, 2, 5, 1, 4, 0 ]
  },
  tenor: {
    glyph: "\uE05C",
    width: 2.6,
    bottomLine: 22,
    glyphStep: 6,
    sharpSteps: [ 2, 6, 3, 7, 4, 8, 5 ],
    flatSteps: [ 5, 8, 4, 7, 3, 6, 2 ]
  }
};

const NOTATED_VALUES = [ 1, 2, 4, 8, 16, 32 ]
  .flatMap(
    duration => [
      { duration, dots: 1 },
      { duration, dots: 0 }
    ]
  )
  .map( value => ({ ...value, length: lengthOf( value ) }) )
  .sort( ( a, b ) => b.length - a.length );

function leftOf( system ) {
  return PAGE_MARGIN + system.indent * SPACE;
}

function svgElement( tag, attributes, parent ) {
  const element = document.createElementNS( SVG_NS, tag );
  for ( const name in attributes )
    element.setAttribute( name, attributes[ name ] );
  parent.appendChild( element );
  return element;
}

function drawGlyph( glyph, x, y, parent, class_name = "glyph" ) {
  svgElement(
    "text",
    { x, y, class: class_name },
    parent
  ).textContent = glyph;
}

function drawText( content, x, y, class_name, parent ) {
  const text = svgElement(
    "text",
    {
      x, y,
      class: class_name
    },
    parent
  );
  text.textContent = content;
  return text;
}

function textWidthOf( content, weight, size ) {
  TEXT_RULER.font = `${ weight } ${ size }px ${ REHEARSAL_FACES }, serif`;
  return TEXT_RULER.measureText( content ).width;
}

function fitText( text, room, weight, size ) {
  const fit = room / textWidthOf( text.textContent, weight, size );
  const fitted_size = size * Math.max( 0.5, Math.min( 1, fit ) );
  if ( fitted_size < size )
    text.style.fontSize = `${ fitted_size }px`;
  const content = text.textContent;
  if ( textWidthOf( content, weight, fitted_size ) <= room )
    return;
  const shortened = length => `${ content.slice( 0, length ) }...`;
  const fits = length =>
    textWidthOf( shortened( length ), weight, fitted_size ) <= room;
  let kept = content.length - 1;
  while ( kept > 1 && !fits( kept ) )
    --kept;
  text.textContent = shortened( kept );
}

function drawLine( x1, y1, x2, y2, thickness, parent ) {
  svgElement(
    "line",
    {
      x1, y1,
      x2, y2,
      "stroke-width": thickness * SPACE
    },
    parent
  );
}

function drawPolygon( points, parent ) {
  svgElement(
    "polygon",
    { points: points.map( point => point.join( "," ) ).join( " " ) },
    parent
  );
}

function staffStepOf( pitch, clef ) {
  const letter_idx = LETTERS.indexOf( pitch.letter );
  return pitch.octave * 7 + letter_idx - CLEFS[ clef ].bottomLine;
}

function yOfStep( staff_top, step ) {
  return staff_top + ( 8 - step ) * STEP;
}

function notatedPiecesOf( length ) {
  let remaining = length;
  const pieces = [];
  while ( remaining > EPSILON ) {
    const piece = NOTATED_VALUES.find(
      value =>
        value.length <= remaining + EPSILON
    ) || NOTATED_VALUES.at( -1 );
    pieces.push( piece );
    remaining -= piece.length;
  }
  return pieces;
}

function staffLengthOf( staff ) {
  return staff.events.reduce(
    ( total, event ) =>
      total + lengthOf( event ),
    0
  );
}

function placedPieceOf( event, piece, start, is_first_piece, previous ) {
  return {
    event,
    start,
    rest: event.rest,
    dots: piece.dots,
    tied: !event.rest,
    pitches: event.pitches,
    duration: piece.duration,
    length: lengthOf( piece ),
    graces: is_first_piece ? event.graces || [] : [],
    continuesTie: Boolean( previous && previous.tied && !event.rest )
  };
}

function measuresOf( events, measure_length, measure_count ) {
  const measures = Array.from( { length: measure_count }, () => [] );
  let previous = null;
  let position = 0;

  const placeEvent = ( event, total_length ) => {
    let remaining = total_length;
    const pieces = [];
    while ( remaining > EPSILON ) {
      const idx = Math.floor( position / measure_length + EPSILON );
      const start = position - idx * measure_length;
      const room = measure_length - start;
      const fits_as_written = remaining === total_length
                           && remaining <= room + EPSILON
                           && !event.padding;
      const notated_pieces = fits_as_written
        ? [ event ]
        : notatedPiecesOf( Math.min( remaining, room ) );
      for ( let i = 0; i < notated_pieces.length; ++i ) {
        const is_first_piece = remaining === total_length;
        const placed = placedPieceOf(
          event,
          notated_pieces[ i ],
          position - idx * measure_length,
          is_first_piece,
          previous
        );
        measures[ idx ] ??= [];
        measures[ idx ].push( placed );
        pieces.push( placed );
        position += placed.length;
        remaining -= placed.length;
        previous = placed;
      }
    }
    if ( previous )
      previous.tied = !event.rest && event.tie;
    markPieces( event, pieces );
  };

  events.forEach( event => placeEvent( event, lengthOf( event ) ) );
  const padding = measure_count * measure_length - position;
  if ( padding > EPSILON ) {
    const full_rest = {
      padding: true,
      pitches: [],
      rest: true,
      marks: []
    };
    placeEvent( full_rest, padding );
  }

  return measures.map(
    measure =>
      wholeMeasureRestOr(
        measure,
        measure_length
      )
  );
}

function markPieces( event, pieces ) {
  event.pieces = pieces;
  const first = pieces[ 0 ];
  const last = pieces.at( -1 );
  const articulations = event.articulations || [];
  first.articulations = articulations.filter(
    articulation => articulation !== "fermata"
  );
  last.fermata = articulations.includes( "fermata" );
  last.fall = Boolean( event.fall );
  last.rise = Boolean( event.rise );
}

function wholeMeasureRestOr( measure, measure_length ) {
  if ( !measure.every( placed => placed.rest ) )
    return measure;
  const fermata = measure.some( placed => placed.fermata );
  return [
    {
      event: measure[ 0 ].event,
      length: measure_length,
      wholeMeasure: true,
      articulations: [],
      duration: 1,
      pitches: [],
      rest: true,
      start: 0,
      fermata,
      dots: 0
    }
  ];
}

function beatLengthOf( meter ) {
  const is_compound = meter.unit >= 8
                   && meter.beats % 3 === 0
                   && meter.beats > 3;
  if ( is_compound )
    return 3 / meter.unit;
  return meter.unit >= 8
    ? measureLengthOf( meter )
    : 1 / meter.unit;
}

function beamGroupsOf( measure, beat_length ) {
  let current_beat = -1;
  const groups = [];
  let current = [];

  const closeGroup = () => {
    if ( current.length > 1 )
      groups.push( current );
    current = [];
  };

  measure.forEach( placed => {
    const beat = Math.floor( placed.start / beat_length + EPSILON );
    const is_beamable = !placed.rest && placed.duration >= 8;
    if ( !is_beamable || beat !== current_beat )
      closeGroup();
    if ( is_beamable ) {
      current.push( placed );
      current_beat = beat;
    }
  });
  closeGroup();
  return groups;
}

function stemDirectionOf( steps ) {
  const highest = Math.max( ...steps );
  const lowest = Math.min( ...steps );
  return highest - 4 >= 4 - lowest ? "down" : "up";
}

function headWidthOf( placed ) {
  return placed.duration === 1 ? 1.69 : 1.18;
}

function leftmostHeadOf( placed ) {
  return Math.min( 0, ...placed.heads.map( head => head.offset ) );
}

function rightmostHeadOf( placed ) {
  return Math.max( 0, ...placed.heads.map( head => head.offset ) );
}

function writtenFifthsOf( sheet, measure_idx ) {
  if ( SHOW_IN_C )
    return 0;
  const start = measure_idx * measureLengthOf( sheet.meter ) + EPSILON;
  return sheet.keyChanges.findLast(
    change => change.position <= start
  ).fifths;
}

function markAccidentals( measure, fifths ) {
  const alterations = {};

  const accidentalFor = ( pitch, is_continuing_tie ) => {
    const name = pitch.letter + pitch.octave;
    const expected = name in alterations
      ? alterations[ name ]
      : keyAlterOf( pitch.letter, fifths );
    alterations[ name ] = pitch.alter;
    const needs_sign = pitch.alter !== expected || (
      SHOW_IN_C && pitch.alter !== 0
    );
    return needs_sign
        && !is_continuing_tie
      ? pitch.alter
      : null;
  };

  measure.forEach( placed => {
    placed.graceAccidentals = ( placed.graces || [] ).map(
      pitch => accidentalFor( pitch, false )
    );
    placed.accidentals = placed.pitches.map(
      pitch => accidentalFor( pitch, placed.continuesTie )
    );
  });
}

function arrangeHeads( placed ) {
  const head_width = headWidthOf( placed );
  const going_up = placed.stem !== "down";
  const heads = placed.pitches
    .map(
      ( pitch, idx ) => ({
          pitch,
          step: placed.steps[ idx ],
          accidental: placed.accidentals[ idx ],
          offset: 0
      })
    ).sort(
      ( a, b ) =>
        going_up
          ? a.step - b.step
          : b.step - a.step
    );
  for ( let i = 1; i < heads.length; ++i ) {
    const head = heads[ i ];
    const neighbor = heads[ i - 1 ];
    if ( neighbor.offset !== 0 )
      continue;
    const step_diff = head.step - neighbor.step;
    if ( Math.abs( step_diff ) === 1 ) {
      head.offset = going_up
        ? head_width - 0.12
        : -( head_width - 0.12 );
    }
  }
  return heads;
}

function arrangeAccidentals( heads ) {
  const columns = [];
  heads.filter( head => head.accidental !== null )
       .sort( ( a, b ) => b.step - a.step )
       .forEach( head => {
         let column = columns.findIndex(
           steps_in_column =>
             steps_in_column.every(
               step =>
                 Math.abs( step - head.step ) >= 6
             )
         );
         if ( column === -1 ) {
           columns.push([]);
           column = columns.length - 1;
         }
         columns[ column ].push( head.step );
         head.accidentalColumn = column;
       });
  return columns.length;
}

function graceAccidentalWidthOf( accidental ) {
  if ( accidental === null )
    return 0;
  return ACCIDENTAL_WIDTHS[ accidental ] * GRACE_SIZE + 0.15;
}

function graceWidthOf( placed ) {
  if ( !placed.graces.length )
    return 0;
  const accidentals = placed.graceAccidentals.reduce(
    ( total, accidental ) =>
      total + graceAccidentalWidthOf( accidental ),
    0
  );
  return placed.graces.length * GRACE_ADVANCE + accidentals + 0.4;
}

function prepareNote( placed, clef ) {
  let widest_accidental = 1.1;
  let any_accidentals = false;

  if ( placed.stem === undefined ) {
    placed.stem = placed.duration === 1
      ? "none"
      : stemDirectionOf( placed.steps );
  }
  placed.heads = arrangeHeads( placed );
  const accidental_columns = arrangeAccidentals( placed.heads );

  const flag_room = placed.beamCount
                 && !placed.beam
                 && placed.stem === "up"
    ? 1.1
    : 0;
  const dot_room = placed.dots
    ? 0.4 + placed.dots * 0.6
    : 0;

  for ( let i = 0; i < placed.heads.length; ++i ) {
    const head = placed.heads[ i ];
    if ( head.accidental === null )
      continue;
    any_accidentals = true;
    const width = ACCIDENTAL_WIDTHS[ head.accidental ];
    if ( width <= widest_accidental )
      continue;
    widest_accidental = width;
  }
  const accidental_room = any_accidentals
    ? ( accidental_columns - 1 ) * 1.1 + widest_accidental + 0.25
    : 0;
  placed.leading = accidental_room - leftmostHeadOf( placed );
  const slide_room = placed.fall || placed.rise ? 2.6 : 0;
  const tie_room = placed.tied ? 1.8 : 0;
  const head_width = headWidthOf( placed );
  placed.trailing = rightmostHeadOf( placed ) + head_width
                  + Math.max( flag_room, dot_room ) + slide_room + tie_room;
  placed.accidentalRoom = placed.leading;
  placed.graceSteps = placed.graces.map(
    pitch => staffStepOf( pitch, clef )
  );
  placed.leading += graceWidthOf( placed );
}

function prepareMeasure( measure, idx, clef, sheet ) {
  markAccidentals( measure, writtenFifthsOf( sheet, idx ) );
  measure.forEach( placed => {
    placed.steps = placed.pitches.map( pitch => staffStepOf( pitch, clef ) );
    placed.beamCount = BEAM_COUNTS[ placed.duration ] || 0;
  });
  measure.beams = beamGroupsOf( measure, beatLengthOf( sheet.meter ) ).map(
    group => {
      const direction = stemDirectionOf(
        group.flatMap( placed => placed.steps )
      );
      const beam = { notes: group, direction };
      for ( let i = 0; i < group.length; ++i ) {
        group[ i ].stem = direction;
        group[ i ].beam = beam;
      }
      return beam;
    }
  );
  measure.forEach( placed => {
    if ( !placed.rest )
      prepareNote( placed, clef );
  });
  measure.filter( placed => placed.rest ).forEach( placed => {
    placed.leading = 0;
    placed.trailing = 1.3 + ( placed.dots ? 0.9 : 0 );
  });
}

function prepareStaves( sheet ) {
  const measure_length = measureLengthOf( sheet.meter );
  const longest_staff = Math.max( ...sheet.staves.map( staffLengthOf ) );
  const measure_count = Math.max(
    1, Math.ceil( longest_staff / measure_length - EPSILON )
  );
  return sheet.staves.map( staff => {
    staff.events.forEach( event => event.marks = [] );
    const measures = measuresOf( staff.events, measure_length, measure_count );
    measures.forEach(
      ( measure, idx ) =>
        prepareMeasure( measure, idx, staff.clef, sheet )
    );
    return {
      clef: staff.clef,
      number: staff.number,
      instrument: staff.instrument,
      measures,
      events: staff.events
    };
  });
}

function spaceFor( length ) {
  return 4 * Math.sqrt( length * 4 );
}

function layoutMeasure( measure_on_each_staff, measure_length ) {
  const everything = measure_on_each_staff.flat();
  const onsets = [
    ...new Set(
      everything.map( placed =>
        placed.start.toFixed( 6 )
      )
    )
  ].map( Number ).sort( ( a, b ) => a - b );
  const columns = onsets.map( ( onset, idx ) => {
    let trailing = 0;
    let leading = 0;
    const items = everything.filter(
      placed =>
        Math.abs( placed.start - onset ) < EPSILON
    );
    for ( let i = 0; i < items.length; ++i ) {
      if ( items[ i ].leading > leading )
        leading = items[ i ].leading;
      if ( items[ i ].trailing > trailing )
        trailing = items[ i ].trailing;
    }
    return {
      onset,
      items,
      leading,
      trailing,
      natural: spaceFor( ( onsets[ idx + 1 ] ?? measure_length ) - onset )
    };
  });
  columns.forEach( ( column, idx ) => {
    const next_leading = idx + 1 < columns.length
      ? columns[ idx + 1 ].leading
      : 0.6;
    column.width = Math.max(
      column.natural,
      column.trailing + 0.6 + next_leading
    );
  });
  const opening = 1.4 + columns[ 0 ].leading;
  let stretchable = 0;
  columns.forEach( column => stretchable += column.width );
  return {
    columns,
    opening,
    stretchable,
    measureOnEachStaff: measure_on_each_staff
  };
}

function keySignatureWidthOf( fifths ) {
  return Math.abs( fifths ) * ( fifths > 0 ? 1.1 : 1 );
}

function timeSignatureWidthOf( meter ) {
  const widthOfNumber = number =>
    String( number ).split( "" )
                    .reduce(
                      ( total, digit ) =>
                        total + TIME_DIGIT_WIDTHS[ digit ],
                      0
                    );
  return Math.max(
    widthOfNumber( meter.beats ),
    widthOfNumber( meter.unit )
  );
}

function keptAccidentalsOf( from, to ) {
  return Math.sign( from ) === Math.sign( to )
    ? Math.min( Math.abs( from ), Math.abs( to ) )
    : 0;
}

function keyChangeWidthOf( from, to ) {
  const cancelled = Math.abs( from ) - keptAccidentalsOf( from, to );
  const gap = cancelled && to ? 0.4 : 0;
  return KEY_CHANGE_INSET + cancelled + gap + keySignatureWidthOf( to ) + 0.8;
}

function settingAt( list, position ) {
  return list.find(
    item => Math.abs( item.position - position ) < EPSILON
  );
}

function withBarlineSettings( layout, sheet, measure_length ) {
  const start = layout.idx * measure_length;
  const end = start + measure_length;
  layout.breakBefore = layout.idx
    ? settingAt( sheet.breaks, start )?.value
    : undefined;
  layout.endStyle = settingAt( sheet.barlines, end )?.value
                 ?? "single";
  layout.rehearsalMark = settingAt( sheet.rehearsalMarks, start )?.text;
  return layout;
}

function withKeyChange( layout, sheet ) {
  if ( !layout.idx )
    return layout;
  const from = writtenFifthsOf( sheet, layout.idx - 1 );
  const to = writtenFifthsOf( sheet, layout.idx );
  if ( from === to )
    return layout;
  layout.keyChange = { from, to, width: keyChangeWidthOf( from, to ) };
  layout.opening += layout.keyChange.width;
  return layout;
}

function dropKeyChange( layout ) {
  if ( !layout.keyChange )
    return;
  layout.opening -= layout.keyChange.width;
  layout.keyChange = null;
}

function instrumentNameOf( staff ) {
  if ( !staff.instrument )
    return "";
  return staff.instrument
    .split( " " )
    .map( word =>
      word.charAt( 0 ).toUpperCase() + word.slice( 1 )
    ).join( " " );
}

function isFullScore( staves ) {
  if ( staves.length > 2 )
    return true;
  if ( staves.length < 2 )
    return false;
  return staves[ 0 ].number !== 1
      || staves[ 0 ].clef !== "treble"
      || staves[ 1 ].number !== 1
      || staves[ 1 ].clef !== "bass";
}

function staffNameWidthOf( name ) {
  return textWidthOf( name, "", 11 ) / SPACE;
}

function isPianoPair( staves, idx ) {
  const upper = staves[ idx ];
  const lower = staves[ idx + 1 ];
  return upper?.clef === "treble"
      && lower?.clef === "bass"
      && upper.number === lower.number;
}

function sharesPairName( staves, idx ) {
  return idx > 0
      && isPianoPair( staves, idx - 1 )
      && staves[ idx ].instrument ===
           staves[ idx - 1 ].instrument;
}

function staffLabelsOf( staves ) {
  const names = staves.map(
    ( staff, idx ) =>
      sharesPairName( staves, idx )
        ? ""
        : instrumentNameOf( staff )
  );
  const totals = {};
  names.forEach(
    name => {
      if ( name )
        totals[ name ] = ( totals[ name ] ?? 0 ) + 1;
    }
  );
  const seen = {};
  return names.map(
    name => {
      if ( !name || totals[ name ] < 2 )
        return name;
      seen[ name ] = ( seen[ name ] ?? 0 ) + 1;
      return `${ name } ${ seen[ name ] }`;
    }
  );
}

function hasPianoPair( staves ) {
  return staves.some(
    ( _, idx ) =>
      isPianoPair( staves, idx )
  );
}

function headerWidthOf( sheet, measure_idx, is_first_system ) {
  const time_signature = is_first_system
    ? timeSignatureWidthOf( sheet.meter ) + 1
    : 0;
  const fifths = writtenFifthsOf( sheet, measure_idx );
  const key_width = keySignatureWidthOf( fifths );
  return 1 + 2.75 + 1 + key_width + time_signature;
}

function braceWidthEstimate() {
  const tallness = 14.5 / 4;
  return 0.35 + 1.31 * Math.sqrt( tallness ) * 0.9;
}

function indentOf( staves ) {
  const labels = staffLabelsOf( staves );
  const max_width = Math.max( ...labels.map( name =>
    name ? staffNameWidthOf( name ) : 0
  ));
  const grouping_room = hasPianoPair( staves )
    ? braceWidthEstimate()
    : 1.1;
  return max_width + 0.5 + grouping_room;
}

function breakIntoSystems( measure_layouts, sheet, staves ) {
  const line_width = ( PAGE_WIDTH - 2 * PAGE_MARGIN ) / SPACE;
  const systems = [];
  let current = null;
  const widthOf = layout => layout.opening + layout.stretchable;
  measure_layouts.forEach( ( layout, idx ) => {
    const is_full = current
                 && current.used + widthOf( layout ) > current.available;
    if ( is_full || layout.breakBefore )
      current = null;
    if ( !current ) {
      dropKeyChange( layout );
      const is_first = !systems.length;
      const indent = is_first && isFullScore( staves )
        ? indentOf( staves )
        : 0;
      const header = headerWidthOf( sheet, idx, is_first );
      current = {
        indent,
        header,
        available: line_width - indent - header,
        used: 0,
        measures: [],
        firstMeasureNumber: idx + 1,
        pageBreak: layout.breakBefore === "page"
      };
      systems.push( current );
    }
    current.measures.push( layout );
    current.used += widthOf( layout );
  });
  systems.forEach( ( system, idx ) => {
    const is_last = idx === systems.length - 1;
    justifySystem( system, is_last );
  });
  return systems;
}

function justifySystem( system, is_last_system ) {
  const opening = system.measures.reduce(
    ( total, layout ) => total + layout.opening,
    0
  );
  const stretchable = system.measures.reduce(
    ( total, layout ) => total + layout.stretchable,
    0
  );
  const full_stretch = ( system.available - opening ) / stretchable;
  const is_mostly_full = system.used / system.available > 0.6;
  const stretch = is_last_system
               && !is_mostly_full
    ? 1
    : full_stretch;
  let x = system.header;
  system.measures.forEach( layout => {
    layout.x = x;
    let column_x = x + layout.opening;
    layout.columns.forEach( column => {
      column.x = column_x;
      column_x += column.width * stretch;
    });
    layout.width = column_x - x;
    x = column_x;
  });
  system.width = x;
}

function verticalExtentOf( measures_of_staff ) {
  const steps = measures_of_staff.flat()
                                 .filter( placed => !placed.rest )
                                 .flatMap( placed => {
                                   const highest = Math.max( ...placed.steps );
                                   const lowest = Math.min( ...placed.steps );
                                   return [
                                     placed.stem === "up"
                                       ? highest + 7
                                       : highest,
                                     placed.stem === "down"
                                       ? lowest - 7
                                       : lowest
                                   ];
                                 });
  return {
    above: Math.max( 8, ...steps ) + 2,
    below: Math.min( 0, ...steps ) - 2
  };
}

function fittedGaps( gaps, fixed ) {
  const total = gaps.reduce( ( sum, gap ) => sum + gap, fixed );
  if ( total <= TALLEST_SYSTEM )
    return gaps;
  const scale = Math.max( 0, TALLEST_SYSTEM - fixed ) / ( total - fixed );
  return gaps.map( gap => Math.max( 4, gap * scale ) );
}

function stackStaves( system, staves ) {
  const extents = staves.map(
    ( _, idx ) =>
      verticalExtentOf(
        system.measures.map(
          layout => layout.measureOnEachStaff[ idx ]
        )
      )
  );
  const top_room = Math.max( 0, extents[ 0 ].above - 8 );
  const bottom_room = -Math.min( 0, extents.at( -1 ).below );
  const gaps = fittedGaps(
    extents.slice( 1 ).map(
      ( extent, idx ) =>
        Math.max( 13, -extents[ idx ].below + extent.above - 8 )
    ),
    top_room + bottom_room + 8 * staves.length
  );
  let top = top_room * STEP;
  system.staffTops = extents.map(
    ( _, idx ) => {
      if ( idx )
        top += ( 8 + gaps[ idx - 1 ] ) * STEP;
      return top;
    }
  );
  system.height = system.staffTops.at( -1 )
    + ( 8 + bottom_room ) * STEP;
}

function arrangeOnPages( systems, sheet ) {
  const title_room = sheet.title || sheet.author
    ? TITLE_ROOM
    : UNTITLED_ROOM;
  let y = PAGE_MARGIN + title_room + TITLE_GAP;
  const pages = [ { systems: [] } ];

  systems.forEach( system => {
    const last_page = pages.at( -1 );
    const overflows = y + system.height > PAGE_HEIGHT - PAGE_MARGIN;
    if ( ( overflows || system.pageBreak )
      && last_page.systems.length
    ) {
      pages.push({ systems: [] });
      y = PAGE_MARGIN;
    }
    system.y = y;
    pages.at( -1 ).systems.push( system );
    y += system.height + SYSTEM_GAP;
  });

  return pages;
}

function drawStaffLines( left, right, top, parent ) {
  const lines = [ 0, 1, 2, 3, 4 ].map(
    line => `M${ left } ${ top + line * SPACE }H${ right }`
  );
  svgElement(
    "path",
    {
      d: lines.join( "" ),
      class: "staffLines",
      "stroke-width": 0.13 * SPACE
    },
    parent
  );
}

function drawAccidentalRow( steps, glyph, advance, x, top, parent ) {
  steps.forEach(
    ( step, idx ) => {
      const y = yOfStep( top, step );
      drawGlyph( glyph, x + idx * advance * SPACE, y, parent );
    }
  );
}

function stepsOfKey( clef, fifths ) {
  return fifths > 0
    ? CLEFS[ clef ].sharpSteps
    : CLEFS[ clef ].flatSteps;
}

function drawKeySignature( clef, fifths, x, top, parent ) {
  drawAccidentalRow(
    stepsOfKey( clef, fifths ).slice( 0, Math.abs( fifths ) ),
    ACCIDENTAL_GLYPHS[ Math.sign( fifths ) ],
    fifths > 0 ? 1.1 : 1,
    x, top, parent
  );
}

function drawKeyChange( change, x, system, staves, parent ) {
  const kept = keptAccidentalsOf( change.from, change.to );
  const cancelled = Math.abs( change.from ) - kept;
  const naturals_x = x + KEY_CHANGE_INSET * SPACE;
  const key_x = naturals_x + ( cancelled + ( cancelled ? 0.4 : 0 ) ) * SPACE;
  staves.forEach(
    ( staff, idx ) => {
      const top = system.y + system.staffTops[ idx ];
      drawAccidentalRow(
        stepsOfKey( staff.clef, change.from ).slice( kept, kept + cancelled ),
        ACCIDENTAL_GLYPHS[ 0 ],
        1,
        naturals_x, top, parent
      );
      drawKeySignature( staff.clef, change.to, key_x, top, parent );
    }
  );
}

function drawTimeSignature( meter, x, top, parent ) {
  const width = timeSignatureWidthOf( meter );
  const drawNumber = ( number, step ) => {
    const digits = String( number ).split( "" );
    const number_width = digits.reduce(
      ( total, digit ) =>
        total + TIME_DIGIT_WIDTHS[ digit ],
      0
    );
    let digit_x = x + ( width - number_width ) / 2 * SPACE;
    digits.forEach( digit => {
      const char_code = 0xE080 + Number( digit );
      drawGlyph(
        String.fromCharCode( char_code ),
        digit_x,
        yOfStep( top, step ),
        parent
      );
      digit_x += TIME_DIGIT_WIDTHS[ digit ] * SPACE;
    });
  };
  drawNumber( meter.beats, 6 );
  drawNumber( meter.unit, 2 );
}

function nameBaselineOf( system, staves, idx ) {
  const top = system.y + system.staffTops[ idx ];
  if ( !sharesPairName( staves, idx + 1 ) )
    return top + 2 * SPACE + 4;
  const bottom = system.y + system.staffTops[ idx + 1 ] + 4 * SPACE;
  return ( top + bottom ) / 2 + 4;
}

function drawInstrumentNames( system, staves, parent ) {
  const marks_end = hasPianoPair( staves )
    ? leftOf( system ) - braceWidthEstimate() * SPACE
    : leftOf( system ) - 1.1 * SPACE;
  const names_end = marks_end - 0.5 * SPACE;
  staffLabelsOf( staves ).forEach(
    ( label, idx ) => {
      if ( !label )
        return;
      const y = nameBaselineOf( system, staves, idx );
      const width = staffNameWidthOf( label ) * SPACE;
      drawText( label, names_end - width, y, "staffName", parent );
    }
  );
}

function drawPianoBrace( system, left, top_idx, bottom_idx, parent ) {
  const top = system.y + system.staffTops[ top_idx ];
  const bottom = system.y + system.staffTops[ bottom_idx ] + 4 * SPACE;
  const tallness = ( bottom - top ) / ( 4 * SPACE );
  const wideness = Math.sqrt( tallness ) * 0.9;
  const brace_x = left - ( 0.35 + 1.31 * wideness ) * SPACE;
  const parts = [
    `translate( ${ brace_x } ${ bottom } )`,
    `scale( ${ wideness } ${ tallness } )`
  ];
  const transform = parts.join( " " );
  const brace = svgElement(
    "text",
    { class: "glyph", transform },
    parent
  );
  brace.textContent = GLYPHS.brace;
}

function drawGrouping( system, staves, parent ) {
  const left = leftOf( system );
  const first_top = system.y + system.staffTops[ 0 ];
  const last_bottom = system.y + system.staffTops.at( -1 ) + 4 * SPACE;
  if ( staves.length < 2 )
    return;
  if ( !isFullScore( staves ) ) {
    drawLine( left, first_top, left, last_bottom, 0.16, parent );
    drawPianoBrace( system, left, 0, 1, parent );
    return;
  }
  const bracket_x = left - 0.6 * SPACE;
  drawLine( bracket_x, first_top, bracket_x, last_bottom, 0.5, parent );
  drawGlyph( GLYPHS.bracketTop, bracket_x + 0.5, first_top + 0.5, parent );
  drawGlyph( GLYPHS.bracketBottom, bracket_x + 0.5, last_bottom - 0.5, parent );
  staves.forEach(
    ( _, idx ) => {
      if ( isPianoPair( staves, idx ) )
        drawPianoBrace( system, left, idx, idx + 1, parent );
    }
  );
}

function drawSystemHeader( system, staves, sheet, is_first_system, parent ) {
  const left = leftOf( system );
  const fifths = writtenFifthsOf( sheet, system.firstMeasureNumber - 1 );
  if ( is_first_system && isFullScore( staves ) )
    drawInstrumentNames( system, staves, parent );
  staves.forEach( ( staff, idx ) => {
    const top = system.y + system.staffTops[ idx ];
    const clef = CLEFS[ staff.clef ];
    const y = yOfStep( top, clef.glyphStep );
    drawGlyph( clef.glyph, left + SPACE, y, parent );
    const key_x = left + ( 1 + clef.width + 1 ) * SPACE;
    drawKeySignature(
      staff.clef,
      fifths, key_x,
      top, parent
    );
    if ( is_first_system ) {
      const key_width = keySignatureWidthOf( fifths );
      const time_x = key_x + ( key_width + 0.6 ) * SPACE;
      drawTimeSignature( sheet.meter, time_x, top, parent );
    }
  });
  drawGrouping( system, staves, parent );
  if ( !is_first_system && sheet.numbers !== "none" ) {
    const first_top = system.y + system.staffTops[ 0 ];
    const number_y = first_top - 2.4 * SPACE;
    drawText(
      system.firstMeasureNumber,
      left, number_y,
      "measureNumber", parent
    );
  }
}

function drawBarline( x, system, style, parent ) {
  const top = system.y + system.staffTops[ 0 ];
  const bottom = system.y + system.staffTops.at( -1 ) + 4 * SPACE;
  if ( style === "final" ) {
    const thick_x = x - 0.25 * SPACE;
    const thin_x = x - 1.05 * SPACE;
    drawLine( thick_x, top, thick_x, bottom, 0.5, parent );
    drawLine( thin_x, top, thin_x, bottom, 0.16, parent );
    return;
  }
  drawLine( x, top, x, bottom, 0.16, parent );
  if ( style !== "double" )
    return;
  drawLine(
    x - 0.6 * SPACE, top,
    x - 0.6 * SPACE, bottom,
    0.16, parent
  );
}

function rehearsalFontOf( size ) {
  return `bold ${ size }px ${ REHEARSAL_FACES }, serif`;
}

function inkOf( text ) {
  TEXT_RULER.font = rehearsalFontOf( 150 );
  const ink = TEXT_RULER.measureText( text );
  return {
    left: ink.actualBoundingBoxLeft / 10,
    width: ( ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight ) / 10,
    above: ink.actualBoundingBoxAscent / 10,
    height: ( ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent ) / 10
  };
}

function rehearsalWidthOf( text ) {
  return inkOf( text ).width / SPACE + 1.2;
}

function drawRehearsalMark( text, x, system, parent ) {
  const ink = inkOf( text );
  const width = rehearsalWidthOf( text ) * SPACE;
  const height = 2.4 * SPACE;
  const first_top = system.y + system.staffTops[ 0 ];
  const bottom = Math.min( system.y - 0.4 * SPACE, first_top - 2 * SPACE );
  const top = bottom - height;
  const box = {
    x, y: top,
    width, height,
    class: "rehearsalBox"
  };
  svgElement( "rect", box, parent );
  const text_x = x + ( width - ink.width ) / 2 + ink.left;
  const baseline = top + ( height - ink.height ) / 2 + ink.above;
  const label = drawText( text, text_x, baseline, "rehearsalMark", parent );
  label.style.font = rehearsalFontOf( 15 );
}

function drawMeasureLabels( layout, system, sheet, parent ) {
  const left = leftOf( system );
  const x = left + layout.x * SPACE;
  if ( layout.rehearsalMark ) {
    drawRehearsalMark(
      layout.rehearsalMark,
      x, system, parent
    );
    return;
  }
  const is_line_start = layout === system.measures[ 0 ];
  if ( sheet.numbers !== "all" || is_line_start )
    return;
  const first_top = system.y + system.staffTops[ 0 ];
  const y = Math.min(
    first_top - 2.4 * SPACE,
    system.y - 0.4 * SPACE
  );
  drawText(
    layout.idx + 1,
    x + 0.3 * SPACE, y,
    "measureNumber", parent
  );
}

function dynamicBaselineOf( placed, top ) {
  const under_staff = top + 7.5 * SPACE;
  if ( placed.rest )
    return under_staff;
  const lowest = yOfStep( top, Math.min( ...placed.steps ) );
  return Math.max( under_staff, lowest + 3 * SPACE );
}

function drawDynamic( placed, top ) {
  const level = placed.event.dynamic?.level;
  if ( !level || placed.event.marks[ 0 ] !== placed.group )
    return;
  const glyphs = [ ...level ].map( letter => DYNAMIC_GLYPHS[ letter ] );
  drawGlyph(
    glyphs.join( "" ),
    placed.drawn.x,
    dynamicBaselineOf( placed, top ),
    placed.group
  );
}

function xOfTime( system, time, measure_length ) {
  const left = leftOf( system );
  const layout = system.measures.find(
    candidate =>
      time < ( candidate.idx + 1 ) * measure_length - EPSILON
  ) ?? system.measures.at( -1 );
  const offset = time - layout.idx * measure_length;
  const column = layout.columns.findLast(
    candidate => candidate.onset <= offset + EPSILON
  ) ?? layout.columns[ 0 ];
  return left + column.x * SPACE;
}

function drawHairpinPart( hairpin, part, y, parent ) {
  const opening = 1.2 * SPACE;
  const length = hairpin.end - hairpin.start;
  const sizeAt = time => {
    const done = ( time - hairpin.start ) / length;
    return opening * (
      hairpin.kind === "<"
        ? done
        : 1 - done
    ) / 2;
  };
  const from = sizeAt( part.from_time );
  const to = sizeAt( part.to_time );
  drawLine( part.from_x, y - from, part.to_x, y - to, 0.12, parent );
  drawLine( part.from_x, y + from, part.to_x, y + to, 0.12, parent );
}

function drawHairpins( hairpins, staff_idx, systems, measure_length ) {
  hairpins.forEach(
    hairpin => systems.forEach(
      system => {
        const first = system.measures[ 0 ].idx * measure_length;
        const last = ( system.measures.at( -1 ).idx + 1 ) * measure_length;
        if ( hairpin.start >= last - EPSILON
          || hairpin.end <= first + EPSILON
        ) return;
        const from_time = Math.max( hairpin.start, first );
        const to_time = Math.min( hairpin.end, last );
        const runs_on = hairpin.end >= last - EPSILON;
        const left = leftOf( system );
        const part = {
          from_time,
          to_time,
          from_x: xOfTime( system, from_time, measure_length ),
          to_x: runs_on
            ? left + system.width * SPACE
            : xOfTime( system, to_time, measure_length ) - 0.8 * SPACE
        };
        const top = system.y + system.staffTops[ staff_idx ];
        drawHairpinPart(
          hairpin, part,
          top + 7 * SPACE,
          system.page
        );
      }
    )
  );
}

function drawLedgerLines( placed, x, top, parent ) {
  const head_width = headWidthOf( placed );
  const left = x + ( leftmostHeadOf( placed ) - 0.4 ) * SPACE;
  const right = x + ( rightmostHeadOf( placed ) + head_width + 0.4 ) * SPACE;
  const lowest = Math.min( ...placed.steps );
  const highest = Math.max( ...placed.steps );
  for ( let step = -2; step >= lowest; step -= 2 ) {
    const y = yOfStep( top, step );
    drawLine( left, y, right, y, 0.16, parent );
  }
  for ( let step = 10; step <= highest; step += 2 ) {
    const y = yOfStep( top, step );
    drawLine( left, y, right, y, 0.16, parent );
  }
}

function noteheadGlyphOf( duration ) {
  switch ( duration ) {
  case 1: return GLYPHS.noteheadWhole;
  case 2: return GLYPHS.noteheadHalf;
  default: return GLYPHS.noteheadBlack;
  }
}

function stemXOf( placed, x ) {
  return placed.stem === "up"
    ? x + ( headWidthOf( placed ) - 0.06 ) * SPACE
    : x + 0.06 * SPACE;
}

function drawAccidental( head, placed, x, y, parent ) {
  const column_right = x + (
    leftmostHeadOf( placed ) - 0.25 - head.accidentalColumn * 1.1
  ) * SPACE;
  drawGlyph(
    ACCIDENTAL_GLYPHS[ head.accidental ],
    column_right - ACCIDENTAL_WIDTHS[ head.accidental ] * SPACE,
    y,
    parent
  );
}

function drawDots( head, placed, x, top, parent ) {
  const step = head.step % 2 === 0 ? head.step + 1 : head.step;
  const first_dot_x = x + (
    rightmostHeadOf( placed ) + headWidthOf( placed ) + 0.4
  ) * SPACE;
  for ( let dot = 0; dot < placed.dots; ++dot ) {
    drawGlyph(
      GLYPHS.dot,
      first_dot_x + dot * 0.6 * SPACE,
      yOfStep( top, step ),
      parent
    );
  }
}

function drawGraceLedgerLines( step, x, top, parent ) {
  const ledger_steps = [];
  for ( let ledger = -2; ledger >= step; ledger -= 2 )
    ledger_steps.push( ledger );
  for ( let ledger = 10; ledger <= step; ledger += 2 )
    ledger_steps.push( ledger );
  const width = 1.18 * GRACE_SIZE;
  ledger_steps.forEach(
    ledger =>
      drawLine(
        x - 0.25 * SPACE,
        yOfStep( top, ledger ),
        x + ( width + 0.25 ) * SPACE,
        yOfStep( top, ledger ),
        0.12,
        parent
      )
  );
}

function drawGraces( placed, x, top, parent ) {
  if ( !placed.graces.length )
    return;
  const stem_top = yOfStep( top, Math.max( ...placed.graceSteps ) + 5 );
  const head_width = 1.18 * GRACE_SIZE * SPACE;
  let grace_x = x - ( placed.leading - 0.2 ) * SPACE;
  const stems = placed.graceSteps.map(
    ( step, idx ) => {
      const accidental = placed.graceAccidentals[ idx ];
      const y = yOfStep( top, step );
      if ( accidental !== null ) {
        drawGlyph(
          ACCIDENTAL_GLYPHS[ accidental ],
          grace_x, y, parent,
          "glyph grace"
        );
        grace_x += graceAccidentalWidthOf( accidental ) * SPACE;
      }
      drawGraceLedgerLines( step, grace_x, top, parent );
      drawGlyph(
        GLYPHS.noteheadBlack,
        grace_x, y, parent,
        "glyph grace"
      );
      const stem_x = grace_x + head_width - 0.05 * SPACE;
      drawLine( stem_x, y, stem_x, stem_top, 0.09, parent );
      grace_x += GRACE_ADVANCE * SPACE;
      return stem_x;
    }
  );
  if ( stems.length === 1 ) {
    drawGlyph(
      FLAG_GLYPHS.up[ 8 ],
      stems[ 0 ] - 0.05 * SPACE,
      stem_top,
      parent,
      "glyph grace"
    );
    const from_x = stems[ 0 ] - 0.6 * SPACE;
    const from_y = stem_top + 1.9 * SPACE;
    const to_x = stems[ 0 ] + 0.9 * SPACE;
    const to_y = stem_top + 0.7 * SPACE;
    drawLine( from_x, from_y, to_x, to_y, 0.1, parent );
    return;
  }
  const last_stem = stems.at( -1 );
  [ 0, 0.5 ].forEach( offset => {
    const y = stem_top + offset * SPACE;
    const points = [
      [ stems[ 0 ] - 0.05 * SPACE, y ],
      [ last_stem + 0.05 * SPACE, y ],
      [ last_stem + 0.05 * SPACE, y + 0.3 * SPACE ],
      [ stems[ 0 ] - 0.05 * SPACE, y + 0.3 * SPACE ]
    ];
    drawPolygon( points, parent );
  });
}

function drawNote( placed, x, top, parent ) {
  drawGraces( placed, x, top, parent );
  drawLedgerLines( placed, x, top, parent );
  for ( let i = 0; i < placed.heads.length; ++i ) {
    const head = placed.heads[ i ];
    const y = yOfStep( top, head.step );
    const glyph_x = x + head.offset * SPACE;
    drawGlyph(
      noteheadGlyphOf( placed.duration ),
      glyph_x, y,
      parent
    );
    if ( head.accidental !== null )
      drawAccidental( head, placed, x, y, parent );
    drawDots( head, placed, x, top, parent );
  }
  placed.stemX = stemXOf( placed, x );
  if ( placed.stem === "none" || placed.beam )
    return;
  const highest = Math.max( ...placed.steps );
  const lowest = Math.min( ...placed.steps );
  const extra_for_flags = Math.max( 0, placed.beamCount - 1 );
  const stem_end = placed.stem === "up"
    ? Math.max( highest + 7 + extra_for_flags, 4 )
    : Math.min( lowest - 7 - extra_for_flags, 4 );
  const stem_start = placed.stem === "up" ? lowest : highest;
  placed.stemTipY = yOfStep( top, stem_end );
  const start_y = yOfStep( top, stem_start );
  const end_y = yOfStep( top, stem_end );
  drawLine(
    placed.stemX, start_y,
    placed.stemX, end_y,
    0.12, parent
  );
  if ( placed.beamCount ) {
    const flag_x = placed.stemX - 0.06 * SPACE;
    const flag_y = yOfStep( top, stem_end );
    drawGlyph(
      FLAG_GLYPHS[ placed.stem ][ placed.duration ],
      flag_x, flag_y,
      parent
    );
  }
}

function drawRest( placed, x, top, measure_layout, parent ) {
  if ( placed.wholeMeasure ) {
    const left = leftOf( placed.drawn.system );
    const center_x = left
                   + measure_layout.x * SPACE
                   + measure_layout.width * SPACE / 2;
    const glyph_x = center_x - 0.56 * SPACE;
    drawGlyph( REST_GLYPHS[ 1 ], glyph_x, yOfStep( top, 6 ), parent );
    return;
  }
  const step = placed.duration === 1 ? 6 : 4;
  drawGlyph(
    REST_GLYPHS[ placed.duration ],
    x, yOfStep( top, step ),
    parent
  );
  for ( let dot = 0; dot < placed.dots; ++dot ) {
    const dot_x = x + ( 1.5 + dot * 0.6 ) * SPACE;
    drawGlyph( GLYPHS.dot, dot_x, yOfStep( top, 5 ), parent );
  }
}

function drawBeam( beam, top, parent ) {
  const notes = beam.notes;
  const going_up = beam.direction === "up";
  const outerStepOf = placed => going_up
    ? Math.max( ...placed.steps )
    : Math.min( ...placed.steps );
  const innerStepOf = placed => going_up
    ? Math.min( ...placed.steps )
    : Math.max( ...placed.steps );
  const first = notes[ 0 ];
  const last = notes.at( -1 );
  const run = last.stemX - first.stemX;
  const outer_steps = notes.map( outerStepOf );
  const first_step = outer_steps[ 0 ];
  const last_step = outer_steps.at( -1 );
  const interior_is_more_extreme = outer_steps.slice( 1, -1 ).some(
    step => going_up
      ? step > Math.max( first_step, last_step )
      : step < Math.min( first_step, last_step )
  );
  const step_diff = last_step - first_step;
  const rise = interior_is_more_extreme
    ? 0
    : Math.max( -2, Math.min( 2, step_diff ) );
  const slope = run > 0 ? -rise * SPACE / 2 / run : 0;
  const beam_count = Math.max( ...notes.map( placed => placed.beamCount ) );
  const stem_length = ( 3.25 + ( beam_count - 1 ) * 0.75 ) * SPACE;
  const middle_y = yOfStep( top, 4 );
  const start_ys = notes.map( placed => {
    const head_y = yOfStep( top, outerStepOf( placed ) );
    const reach = going_up
      ? Math.min( head_y - stem_length, middle_y )
      : Math.max( head_y + stem_length, middle_y );
    return reach - slope * ( placed.stemX - first.stemX );
  });
  const start_y = going_up ? Math.min( ...start_ys ) : Math.max( ...start_ys );
  const beamYAt = x => start_y + slope * ( x - first.stemX );

  drawBeamStems( notes, top, innerStepOf, beamYAt );
  drawBeamLevels(
    notes, beam_count,
    first, last,
    going_up, beamYAt,
    parent
  );
}

function drawBeamStems( notes, top, innerStepOf, beamYAt ) {
  for ( let i = 0; i < notes.length; ++i ) {
    const placed = notes[ i ];
    placed.stemTipY = beamYAt( placed.stemX );
    const inner_y = yOfStep( top, innerStepOf( placed ) );
    drawLine( placed.stemX, inner_y, placed.stemX,
      placed.stemTipY, 0.12, placed.group );
  }
}

function drawBeamLevels(
  notes, beam_count,
  first, last,
  going_up,
  beamYAt,
  parent
) {
  const toward_heads = going_up ? 1 : -1;
  const thickness = 0.5 * SPACE;
  const half = 0.06 * SPACE;

  const drawSegment = ( from_x, to_x, level ) => {
    const offset = level * 0.75 * SPACE * toward_heads;
    const from_y = beamYAt( from_x ) + offset;
    const to_y = beamYAt( to_x ) + offset;
    const edge = [ [ from_x, from_y ], [ to_x, to_y ] ];
    const flipped = [ ...edge ].reverse().map(
      ([ x, y ]) => [
        x,
        y + thickness * toward_heads
      ]
    );
    drawPolygon( [ ...edge, ...flipped ], parent );
  };

  drawSegment( first.stemX - half, last.stemX + half, 0 );

  for ( let level = 1; level < beam_count; ++level ) {
    let run_start = null;
    notes.forEach( ( placed, idx ) => {
      const reaches = placed.beamCount > level;
      if ( reaches && run_start === null )
        run_start = idx;
      const run_ends = run_start !== null && (
        !reaches || idx === notes.length - 1
      );
      if ( !run_ends )
        return;
      const run_end = reaches ? idx : idx - 1;
      const from = notes[ run_start ];
      const to = notes[ run_end ];
      if ( run_start !== run_end )
        drawSegment( from.stemX - half, to.stemX + half, level );
      else if ( !run_start )
        drawSegment( from.stemX - half, from.stemX + 1.1 * SPACE, level );
      else
        drawSegment( from.stemX - 1.1 * SPACE, from.stemX + half, level );
      run_start = null;
    });
  }
}

function drawCurve( from_x, from_y, to_x, to_y, height, direction, parent ) {
  const thickness = 0.4 * SPACE;
  const middle_x = ( from_x + to_x ) / 2;
  const middle_y = ( from_y + to_y ) / 2;
  const outer_y = middle_y + height * direction;
  const inner_y = middle_y + ( height - thickness ) * direction;
  const d = `M ${ from_x } ${ from_y }
    Q ${ middle_x } ${ outer_y } ${ to_x } ${ to_y }
    Q ${ middle_x } ${ inner_y } ${ from_x } ${ from_y } Z`;
  svgElement( "path", { d, class: "tie" }, parent );
}

function drawTie( from_x, to_x, y, direction, parent ) {
  const height = Math.max(
    1.1 * SPACE,
    Math.min(
      3 * SPACE,
      ( to_x - from_x ) * 0.25
    )
  );
  drawCurve( from_x, y, to_x, y, height, direction, parent );
}

function tieDirectionOf( placed, head ) {
  const middle = (
    Math.max( ...placed.steps ) + Math.min( ...placed.steps )
  ) / 2;
  if ( placed.heads.length > 1 && head.step !== middle )
    return head.step > middle ? -1 : 1;
  return placed.stem === "up" ? 1 : -1;
}

function drawTiesOfStaff( measures ) {
  const notes = measures.flat().filter( placed => !placed.rest );
  notes.forEach( ( placed, idx ) => {
    const next = notes[ idx + 1 ];
    if ( !placed.tied || !next || !placed.drawn || !next.drawn )
      return;
    const from_x = placed.drawn.x + (
      rightmostHeadOf( placed ) + headWidthOf( placed ) + 0.2
    ) * SPACE;
    const to_x = next.drawn.x + ( leftmostHeadOf( next ) - 0.2 ) * SPACE;
    placed.heads.forEach( head => {
      const target = next.heads.find(
        other =>
          midiOf( other.pitch ) === midiOf( head.pitch )
      );
      if ( !target )
        return;
      const direction = tieDirectionOf( placed, head );
      const from_y = yOfStep(
        placed.drawn.top,
        head.step
      ) + direction * 0.6 * SPACE;
      if ( placed.drawn.system === next.drawn.system ) {
        drawTie( from_x, to_x, from_y, direction, placed.group );
        return;
      }
      const system_left = leftOf( placed.drawn.system );
      const system_end = system_left + placed.drawn.system.width * SPACE;
      drawTie( from_x, system_end + SPACE, from_y, direction, placed.group );
      const next_y = yOfStep(
        next.drawn.top,
        target.step
      ) + direction * 0.6 * SPACE;
      const from = next.drawn.x - 2.5 * SPACE;
      drawTie( from, to_x, next_y, direction, next.group );
    });
  });
}

function spaceAwayFromLines( step, direction ) {
  return step >= 0
      && step <= 8
      && step % 2 === 0
    ? step + direction
    : step;
}

function articulationSideOf( placed ) {
  return placed.stem === "up" ? "below" : "above";
}

function drawArticulations( placed, top, parent ) {
  if ( !placed.articulations?.length || placed.rest )
    return;
  const side = articulationSideOf( placed );
  const direction = side === "above" ? 1 : -1;
  const center_x = placed.drawn.x + headWidthOf( placed ) * SPACE / 2;
  const outer_step = side === "above"
    ? Math.max( ...placed.steps )
    : Math.min( ...placed.steps );
  let step = outer_step + 2 * direction;
  [ "staccato", "tenuto", "accent" ]
    .filter( articulation => placed.articulations.includes( articulation ) )
    .forEach( articulation => {
      step = spaceAwayFromLines( step, direction );
      const y_offset = side === "above" ? 0 : -0.2;
      const y = yOfStep( top, step ) + 0.5 * SPACE * y_offset;
      drawGlyph( ARTICULATION_GLYPHS[ articulation ][ side ], center_x, y,
        parent, "glyph centered" );
      step += 2 * direction;
    });
}

function drawFermata( placed, top, measure_layout, parent ) {
  if ( !placed.fermata )
    return;
  const measure_middle = measure_layout.x + measure_layout.width / 2;
  const head_middle = placed.rest ? 0.6 : headWidthOf( placed ) / 2;
  const center_x = placed.wholeMeasure
    ? leftOf( placed.drawn.system )
      + measure_middle * SPACE
    : placed.drawn.x + head_middle * SPACE;
  const highest_head = placed.rest
    ? top
    : yOfStep( top, Math.max( ...placed.steps ) ) - SPACE;
  const stem_tip = placed.stem === "up" ? placed.stemTipY : Infinity;
  const y = Math.min(
    top - 0.8 * SPACE,
    highest_head - 0.6 * SPACE,
    stem_tip - 0.8 * SPACE
  );
  drawGlyph( FERMATA_GLYPH, center_x, y, parent, "glyph centered" );
}

function drawSlide( placed, top, parent ) {
  if ( !placed.fall && !placed.rise )
    return;
  const head_width = headWidthOf( placed );
  const dot_room = placed.dots ? 0.4 + placed.dots * 0.6 : 0;
  const start_x = placed.drawn.x + (
    rightmostHeadOf( placed ) + head_width + 0.35 + dot_room
  ) * SPACE;
  const step = placed.fall
    ? Math.min( ...placed.steps )
    : Math.max( ...placed.steps );
  const y = yOfStep( top, step );
  const drop = placed.fall
    ? 1.8 * SPACE
    : -1.8 * SPACE;
  const end_x = start_x + 2 * SPACE;
  const control_x = start_x + 1.4 * SPACE;
  const d = `M ${ start_x } ${ y } Q ${ control_x } ${ y }
    ${ end_x } ${ y + drop }`;
  svgElement( "path", { d, class: "slide" }, parent );
}

function drawTuplets( measure, top, clef, parent ) {
  const tuplets = new Map();
  measure.filter( placed => placed.event.tuplet )
         .forEach( placed => {
           if ( !tuplets.has( placed.event.tuplet ) )
             tuplets.set( placed.event.tuplet, [] );
           tuplets.get( placed.event.tuplet ).push( placed );
         });
  tuplets.forEach( ( members, tuplet ) => {
    const above = clef !== "bass";
    const direction = above ? -1 : 1;
    const left_x = members[ 0 ].drawn.x;
    const last_member = members.at( -1 );
    const right_x = last_member.drawn.x + ( last_member.rest
      ? 1.2
      : headWidthOf( last_member )
    ) * SPACE;
    const outermost = members.map( placed => {
      if ( placed.rest )
        return above ? top : top + 4 * SPACE;
      const step = above
        ? Math.max( ...placed.steps )
        : Math.min( ...placed.steps );
      const head_y = yOfStep( top, step );
      const tip_y = placed.stem === ( above ? "up" : "down" )
        ? placed.stemTipY
        : head_y;
      return above
        ? Math.min( head_y - SPACE, tip_y )
        : Math.max( head_y + SPACE, tip_y );
    });
    const edge_y = above
      ? Math.min( top, ...outermost ) - 1.2 * SPACE
      : Math.max( top + 4 * SPACE, ...outermost ) + 1.2 * SPACE;
    const center_x = ( left_x + right_x ) / 2;
    const number_y = edge_y + 0.55 * SPACE;
    const digits = String( tuplet.count ).split( "" )
                                         .map(
                                           digit =>
                                             String.fromCharCode(
                                               0xE880 + Number( digit )
                                             )
                                         ).join( "" );
    drawGlyph(
      digits,
      center_x, number_y,
      parent,
      "glyph centered tupletNumber"
    );
    const gap = 1.1 * SPACE;
    const hook = 0.7 * SPACE * -direction;
    drawLine( left_x, edge_y + hook, left_x, edge_y, 0.12, parent );
    drawLine( left_x, edge_y, center_x - gap, edge_y, 0.12, parent );
    drawLine( center_x + gap, edge_y, right_x, edge_y, 0.12, parent );
    drawLine( right_x, edge_y, right_x, edge_y + hook, 0.12, parent );
  });
}

function drawRepeatDots( x, system, parent ) {
  system.staffTops.forEach(
    staff_top =>
      [ 3, 5 ].forEach(
        step => {
          const y = yOfStep( system.y + staff_top, step );
          svgElement( "circle", { cx: x, cy: y, r: 0.25 * SPACE }, parent );
        }
      )
  );
}

function drawRepeatStart( x, system, joins_an_ending, parent ) {
  const top = system.y + system.staffTops[ 0 ];
  const bottom = system.y + system.staffTops.at( -1 ) + 4 * SPACE;
  if ( !joins_an_ending )
    drawLine( x + 0.25 * SPACE, top, x + 0.25 * SPACE, bottom, 0.5, parent );
  drawLine( x + 0.95 * SPACE, top, x + 0.95 * SPACE, bottom, 0.16, parent );
  drawRepeatDots( x + 1.5 * SPACE, system, parent );
}

function drawRepeatEnd( x, system, parent ) {
  const top = system.y + system.staffTops[ 0 ];
  const bottom = system.y + system.staffTops.at( -1 ) + 4 * SPACE;
  drawRepeatDots( x - 1.6 * SPACE, system, parent );
  drawLine( x - 1.05 * SPACE, top, x - 1.05 * SPACE, bottom, 0.16, parent );
  drawLine( x - 0.25 * SPACE, top, x - 0.25 * SPACE, bottom, 0.5, parent );
}

function slurChainsOf( events ) {
  const chains = [];
  let chain = null;
  events.filter( event => !event.rest && event.pieces )
        .forEach( event => {
          if ( chain )
            chain.push( event );
          else if ( event.slur )
            chain = [ event ];
          if ( chain && !event.slur ) {
            chains.push( chain );
            chain = null;
          }
        });
  return chains.filter( found => found.length > 1 );
}

function slurEndOf( placed, above ) {
  const step = above
    ? Math.max( ...placed.steps )
    : Math.min( ...placed.steps );
  const head_y = yOfStep( placed.drawn.top, step );
  const clears_head = above
    ? head_y - 0.9 * SPACE
    : head_y + 0.9 * SPACE;
  const stem_on_this_side = placed.stem === ( above ? "up" : "down" );
  if ( !stem_on_this_side )
    return clears_head;
  return above
    ? Math.min( clears_head, placed.stemTipY - 0.5 * SPACE )
    : Math.max( clears_head, placed.stemTipY + 0.5 * SPACE );
}

function drawSlurPart( notes, from_x, to_x, above, parent ) {
  const direction = above ? -1 : 1;
  const from_y = slurEndOf( notes[ 0 ], above );
  const to_y = slurEndOf( notes.at( -1 ), above );
  const span = Math.max( 1, to_x - from_x );
  const lineYAt = x => from_y + ( to_y - from_y ) * ( x - from_x ) / span;
  const intrusions = notes.slice( 1, -1 ).map(
    placed => {
      const end_y = slurEndOf( placed, above );
      const line_y = lineYAt( placed.drawn.x );
      return ( end_y - line_y ) * direction;
    }
  );
  const intrusion = Math.max( 0, ...intrusions );
  const natural_height = Math.min( 3 * SPACE, ( to_x - from_x ) * 0.15 );
  const clearance = 2 * intrusion + SPACE;
  const height = Math.max( natural_height, 1.4 * SPACE, clearance );
  drawCurve( from_x, from_y, to_x, to_y, height, direction, parent );
}

function drawSlursOfStaff( staff ) {
  slurChainsOf( staff.events ).forEach( chain => {
    const notes = chain.flatMap( event => event.pieces )
                       .filter( placed => placed.drawn );
    const first = chain[ 0 ].pieces[ 0 ];
    const last = chain.at( -1 ).pieces[ 0 ];
    const span = notes.slice( 0, notes.indexOf( last ) + 1 );
    const above = !span.every( placed => placed.stem === "up" );
    const centerOf = placed => {
      const width = headWidthOf( placed );
      return placed.drawn.x + width * SPACE / 2;
    };
    const systems = [ ...new Set( span.map( placed => placed.drawn.system ) ) ];
    systems.forEach( system => {
      const part = span.filter( placed => placed.drawn.system === system );
      const starts_here = part[ 0 ] === first;
      const ends_here = part.at( -1 ) === last;
      const from_x = starts_here
        ? centerOf( first )
        : part[ 0 ].drawn.x - 2 * SPACE;
      const to_x = ends_here
        ? centerOf( last )
        : leftOf( system )
            + system.width * SPACE + 0.5 * SPACE;
      drawSlurPart( part, from_x, to_x, above, part[ 0 ].group );
    });
  });
}

function drawMeasure( layout, system, staves, parent ) {
  const left = leftOf( system );
  staves.forEach( ( staff, staff_idx ) => {
    const top = system.y + system.staffTops[ staff_idx ];
    const measure = layout.measureOnEachStaff[ staff_idx ];
    measure.forEach( placed => {
      let column = null;
      for ( const c of layout.columns ) {
        if ( Math.abs( c.onset - placed.start ) < EPSILON ) {
          column = c;
          break;
        }
      }
      const x = left + column.x * SPACE;
      const group = document.createElementNS( SVG_NS, "g" );
      placed.event.marks.push( group );
      placed.group = group;
      placed.drawn = { x, top, system };
      if ( placed.rest )
        drawRest( placed, x, top, layout, group );
      else
        drawNote( placed, x, top, group );
      parent.appendChild( group );
    });
    measure.beams.forEach( beam => {
      const group = document.createElementNS( SVG_NS, "g" );
      drawBeam( beam, top, group );
      parent.appendChild( group );
    });
    measure.forEach( placed => {
      drawDynamic( placed, top );
      drawArticulations( placed, top, placed.group );
      drawFermata( placed, top, layout, placed.group );
      if ( !placed.rest )
        drawSlide( placed, top, placed.group );
    });
    drawTuplets( measure, top, staff.clef, parent );
  });
}

function drawTitleBlock( sheet, parent ) {
  const room = PAGE_WIDTH - 2 * PAGE_MARGIN;
  if ( sheet.title ) {
    const title_y = PAGE_MARGIN + 22;
    fitText(
      drawText(
        sheet.title,
        PAGE_WIDTH / 2,
        title_y,
        "title",
        parent
      ),
      room, "bold", 26
    );
  }
  if ( sheet.author ) {
    const author_x = PAGE_WIDTH - PAGE_MARGIN;
    const author_y = PAGE_MARGIN + 58;
    fitText(
      drawText(
        sheet.author,
        author_x, author_y,
        "author",
        parent
      ),
      room, "", 14
    );
  }
}

function drawTempo( sheet, system, parent ) {
  const left = leftOf( system );
  const mark = system.measures[ 0 ].rehearsalMark;
  const shift = mark ? rehearsalWidthOf( mark ) + 1 : 0;
  const x = left + ( system.header + 0.5 + shift ) * SPACE;
  const y = system.y - 3 * SPACE;
  drawGlyph( GLYPHS.metronomeQuarter, x, y, parent );
  drawText( `= ${ sheet.bpm }`, x + 1.8 * SPACE, y, "tempo", parent );
}

function drawSystemMeasures( system, staves, sheet, is_last_system, svg ) {
  const left = leftOf( system );
  system.measures.forEach(
    ( layout, idx ) => {
      const previous = system.measures[ idx - 1 ];
      let x = left + layout.x * SPACE;
      if ( layout.keyChange ) {
        drawKeyChange( layout.keyChange, x, system, staves, svg );
        x += layout.keyChange.width * SPACE;
      }
      if ( layout.repeatStart ) {
        const joins_end = !layout.keyChange && Boolean( previous?.repeatEnd );
        drawRepeatStart( x, system, joins_end, svg );
      }
      drawMeasureLabels( layout, system, sheet, svg );
      drawMeasure( layout, system, staves, svg );
      const is_final = is_last_system && idx === system.measures.length - 1;
      const end_x = left + ( layout.x + layout.width ) * SPACE;
      if ( layout.repeatEnd )
        drawRepeatEnd( end_x, system, svg );
      if ( layout.loopEnd ) {
        const y = system.y + system.staffTops[ 0 ] - 1.4 * SPACE;
        drawText( "∞", end_x, y, "loopMark", svg );
        return;
      }
      const style = layout.repeatEnd ? "single" : layout.endStyle;
      drawBarline( end_x, system, is_final ? "final" : style, svg );
    }
  );
}

function drawPage( page, page_idx, staves, sheet, is_last_page ) {
  const svg = document.createElementNS( SVG_NS, "svg" );
  svg.setAttribute( "viewBox", `0 0 ${ PAGE_WIDTH } ${ PAGE_HEIGHT }` );
  svg.setAttribute( "class", "page" );
  if ( !page_idx )
    drawTitleBlock( sheet, svg );
  page.systems.forEach(
    ( system, system_idx ) => {
      system.page = svg;
      const is_first_system = !page_idx
                           && !system_idx;
      const is_last_system = is_last_page
                          && system_idx === page.systems.length - 1;
      const left = leftOf( system );
      const right = left + system.width * SPACE;
      staves.forEach(
        ( _, idx ) => {
          const top = system.y + system.staffTops[ idx ];
          drawStaffLines( left, right, top, svg );
        }
      );
      drawSystemHeader(
        system, staves, sheet,
        is_first_system, svg
      );
      if ( is_first_system )
        drawTempo( sheet, system, svg );
      drawSystemMeasures(
        system, staves, sheet,
        is_last_system, svg
      );
    }
  );
  return svg;
}

function playheadStopsOf( systems, measure_length ) {
  return systems.flatMap( system => {
    const left = leftOf( system );
    const stops = system.measures.flatMap(
      layout => layout.columns.map(
        column => {
          const time = layout.idx * measure_length + column.onset;
          const x = left + ( column.x + 0.6 ) * SPACE;
          return { time, x, system };
        }
      )
    );
    const last_measure = system.measures.at( -1 );
    const last_time = ( last_measure.idx + 1 ) * measure_length;
    stops.push({
      time: last_time,
      x: left + system.width * SPACE,
      system
    });
    return stops;
  });
}

function repeatSignsOf( sheet ) {
  const loop = sheet.loop
    ? [
      { kind: "start", position: sheet.loop.start, loop: true },
      { kind: "end", position: sheet.loop.end, loop: true }
    ]
    : [];
  return [ ...sheet.repeats, ...loop ];
}

function withRepeatSigns( layout, repeats, measure_length ) {
  const isAt = ( sign, position ) =>
    Math.abs( sign.position - position ) < EPSILON;
  const end_time = ( layout.idx + 1 ) * measure_length;
  layout.loopEnd = repeats.some(
    sign => sign.loop
         && sign.kind === "end"
         && isAt( sign, end_time )
  );
  layout.repeatStart = repeats.some(
    sign => sign.kind === "start"
         && isAt( sign, layout.idx * measure_length )
  );
  layout.repeatEnd = repeats.some(
    sign => sign.kind === "end"
         && isAt( sign, end_time )
  );
  if ( layout.repeatStart )
    layout.opening += 1.8;
  if ( layout.repeatEnd ) {
    layout.columns.at( -1 ).width += 1.8;
    layout.stretchable += 1.8;
  }
  return layout;
}

function scrollToNewPage( pages_before ) {
  if ( !pages_before || SCORE.children.length !== pages_before + 1 )
    return;
  const new_page = SCORE.children[ pages_before ];
  const page_top = new_page.getBoundingClientRect().top;
  const score_top = SCORE.getBoundingClientRect().top;
  SCORE.scrollTop += page_top - score_top;
}

function renderScore( sheet ) {
  const pages_before = SCORE.children.length;
  const staves = prepareStaves( sheet );
  const measure_length = measureLengthOf( sheet.meter );
  const layouts = staves[ 0 ].measures.map( ( _, idx ) => {
    const staff_measures = staves.map( staff => staff.measures[ idx ] );
    const raw_layout = layoutMeasure( staff_measures, measure_length );
    const layout = { ...raw_layout, idx };
    withKeyChange( layout, sheet );
    withBarlineSettings( layout, sheet, measure_length );
    return withRepeatSigns( layout, repeatSignsOf( sheet ), measure_length );
  });
  const systems = breakIntoSystems( layouts, sheet, staves );
  systems.forEach( system => stackStaves( system, staves ) );
  const pages = arrangeOnPages( systems, sheet );
  const page_svgs = pages.map( ( page, idx ) => {
    const is_last = idx === pages.length - 1;
    return drawPage( page, idx, staves, sheet, is_last );
  });
  staves.forEach( staff => drawTiesOfStaff( staff.measures ) );
  staves.forEach( staff => drawSlursOfStaff( staff ) );
  sheet.staves.forEach(
    ( staff, idx ) =>
      drawHairpins( staff.hairpins, idx, systems, measure_length )
  );
  PLAYHEAD_STOPS = playheadStopsOf( systems, measure_length );
  SCORE.replaceChildren( ...page_svgs );
  scrollToNewPage( pages_before );
}
