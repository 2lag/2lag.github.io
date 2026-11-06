function repeatPairsOf( repeats, from, to, level ) {
  const open_starts = [];
  const pairs = [];

  const signs = repeats.filter(
    sign => sign.level === level
         && sign.position >= from - EPSILON
         && sign.position <= to + EPSILON
  )
    .sort( ( a, b ) => a.position - b.position
                    || ( a.kind === "end" ? -1 : 1 )
    );
  signs.forEach( sign => {
    if ( sign.kind === "start" ) {
      open_starts.push( sign.position );
      return;
    }
    const start = open_starts.length ? open_starts.pop() : from;
    pairs.push({ start, end: sign.position });
  });
  return pairs.sort( ( a, b ) => a.start - b.start );
}

function hasRepeatsInside( repeats, from, to, level ) {
  return repeats.some(
    sign => sign.level >= level
         && sign.position >= from - EPSILON
         && sign.position <= to + EPSILON );
}

function unfold( repeats, from, to, level ) {
  const segments = [];
  let cursor = from;

  if ( to - from <= EPSILON )
    return [];
  if ( !hasRepeatsInside( repeats, from, to, level ) )
    return [{ start: from, end: to }];
  repeatPairsOf( repeats, from, to, level ).forEach(
    pair => {
      const body = unfold( repeats, pair.start, pair.end, level + 1 );
      const before_body = unfold( repeats, cursor, pair.start, level + 1 );
      segments.push( ...before_body, ...body, ...body );
      cursor = pair.end;
    }
  );
  segments.push( ...unfold( repeats, cursor, to, level + 1 ) );
  return segments;
}

function joinedSegments( segments ) {
  return segments.reduce(
    ( joined, segment ) => {
      const previous = joined.at( -1 );
      if ( previous && Math.abs( previous.end - segment.start ) < EPSILON )
        previous.end = segment.end;
      else
        joined.push({ ...segment });
      return joined;
    },
    []
  );
}

function performanceSegmentsOf( repeats, song_length ) {
  return joinedSegments( unfold( repeats, 0, song_length, 1 ) );
}
