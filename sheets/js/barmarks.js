function measureStartsOf( parsed ) {
  const measure_length = measureLengthOf( parsed.meter );
  return parsed.staves.flatMap(
    staff =>
      timedEventsOf( staff )
        .filter(
          item =>
            isOnBarline( item.start, measure_length ) &&
            item.event.token
        )
        .map(
          item => {
            const source = eventSourceOf( item.event );
            const number = Math.round( item.start / measure_length ) + 1;
            return { source, number };
          }
        )
  );
}

function markerColumnOf( source, line_text ) {
  const before = line_text[ source.column - 1 ];
  return before === "{" || before === "("
    ? source.column - 1
    : source.column;
}

function eventSourceOf( event ) {
  return event.countSource
      || event.graceSources?.[ 0 ]
      || event;
}

function spanOf( numbers ) {
  const unique = [ ...new Set( numbers ) ].sort( ( a, b ) => a - b );
  const first = unique[ 0 ];
  const is_run = unique.every( ( number, index ) => number === first + index );
  if ( is_run && unique.length > 1 )
    return `${ unique[ 0 ] }–${ unique.at( -1 ) }`;
  return unique.join( "," );
}

function barRangesOn( line_number, line_text, measure_starts ) {
  const numbers_at = new Map();
  measure_starts.filter(
    measure_start => measure_start.source.line === line_number
  ).forEach( measure_start => {
    const at = markerColumnOf( measure_start.source, line_text );
    const existing = numbers_at.get( at ) || [];
    numbers_at.set( at, [ ...existing, measure_start.number ] );
  });
  return [ ...numbers_at ].map( ([ at, numbers ]) => {
    const marker = document.createElement( "span" );
    marker.className = "barMarker";
    marker.dataset.measure = spanOf( numbers );
    return { start: at, end: at, element: marker };
  });
}
