const ROOM_ECHO_SAMPLES = {};
let AUDIO_MIX = null;

const PLAIN_SOUND = {
  vibrato: 0,
  tremolo: 0,
  bite: 0,
  breath: 0,
  scoop: 0,
  voices: 1,
  body: "plain"
};

const SOUND_PRESETS = {
  piano: {
    ...PLAIN_SOUND,
    waveform: "triangle",
    brightness: 6000,
    overtone: 0.3,
    release: 0.15,
    attack: 0.004,
    volume: 0.7,
    sustain: 0,
    decay: 1.2,
    detune: 2,
    room: 0.2
  },
  "electric piano": {
    ...PLAIN_SOUND,
    brightness: 4000,
    waveform: "sine",
    overtone: 0.5,
    sustain: 0.05,
    tremolo: 0.15,
    attack: 0.003,
    release: 0.3,
    volume: 0.75,
    decay: 1.6,
    room: 0.25,
    detune: 6
  },
  organ: {
    ...PLAIN_SOUND,
    brightness: 3000,
    waveform: "sine",
    overtone: 0.8,
    release: 0.08,
    attack: 0.02,
    volume: 0.55,
    sustain: 1,
    room: 0.35,
    detune: 3,
    decay: 10
  },
  "music box": {
    ...PLAIN_SOUND,
    brightness: 9000,
    waveform: "sine",
    overtone: 0.6,
    attack: 0.001,
    release: 0.3,
    volume: 0.7,
    decay: 0.35,
    sustain: 0,
    detune: 0,
    room: 0.4
  },
  vibraphone: {
    ...PLAIN_SOUND,
    brightness: 7000,
    waveform: "sine",
    overtone: 0.25,
    tremolo: 0.45,
    attack: 0.002,
    release: 0.9,
    volume: 0.75,
    sustain: 0,
    decay: 2.8,
    detune: 1,
    room: 0.5
  },
  "soft pad": {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 1400,
    overtone: 0.2,
    release: 0.8,
    sustain: 0.7,
    attack: 0.35,
    volume: 0.45,
    detune: 8,
    decay: 3,
    room: 0.6
  },
  chiptune: {
    ...PLAIN_SOUND,
    waveform: "square",
    brightness: 12000,
    release: 0.03,
    attack: 0.001,
    sustain: 0.8,
    volume: 0.35,
    overtone: 0,
    detune: 0,
    decay: 10,
    room: 0
  },
  violin: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 5000,
    body: "strings",
    overtone: 0.1,
    release: 0.25,
    vibrato: 0.45,
    sustain: 0.9,
    attack: 0.08,
    breath: 0.04,
    volume: 0.38,
    scoop: 0.12,
    bite: 0.15,
    detune: 3,
    decay: 10,
    room: 0.4
  },
  strings: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 3600,
    body: "strings",
    overtone: 0.05,
    release: 0.6,
    sustain: 0.9,
    vibrato: 0.3,
    attack: 0.28,
    volume: 0.36,
    detune: 12,
    voices: 3,
    decay: 10,
    room: 0.6
  },
  cello: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 2400,
    body: "strings",
    overtone: 0.1,
    release: 0.35,
    sustain: 0.9,
    vibrato: 0.4,
    breath: 0.03,
    volume: 0.42,
    attack: 0.1,
    scoop: 0.1,
    bite: 0.15,
    detune: 3,
    decay: 10,
    room: 0.4
  },
  "upright bass": {
    ...PLAIN_SOUND,
    waveform: "pluck",
    brightness: 1500,
    release: 0.12,
    attack: 0.003,
    volume: 0.95,
    body: "wood",
    overtone: 0,
    sustain: 0,
    decay: 1.6,
    room: 0.15,
    detune: 0
  },
  guitar: {
    ...PLAIN_SOUND,
    waveform: "pluck",
    brightness: 4500,
    attack: 0.002,
    release: 0.2,
    body: "wood",
    overtone: 0,
    volume: 0.9,
    sustain: 0,
    decay: 2.4,
    detune: 0,
    room: 0.3
  },
  harp: {
    ...PLAIN_SOUND,
    waveform: "pluck",
    brightness: 7000,
    attack: 0.002,
    release: 0.7,
    overtone: 0,
    volume: 0.9,
    sustain: 0,
    decay: 3.5,
    room: 0.55,
    detune: 0
  },
  trumpet: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 5500,
    overtone: 0.15,
    sustain: 0.85,
    vibrato: 0.12,
    body: "brass",
    release: 0.1,
    attack: 0.03,
    breath: 0.05,
    volume: 0.36,
    scoop: 0.25,
    detune: 2,
    decay: 10,
    bite: 0.8,
    room: 0.3
  },
  "muted trumpet": {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 4500,
    overtone: 0.1,
    release: 0.12,
    sustain: 0.8,
    vibrato: 0.2,
    attack: 0.02,
    breath: 0.08,
    volume: 0.45,
    body: "mute",
    scoop: 0.3,
    detune: 2,
    decay: 10,
    room: 0.4,
    bite: 0.4
  },
  trombone: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 2600,
    body: "brass",
    overtone: 0.1,
    sustain: 0.85,
    release: 0.15,
    vibrato: 0.1,
    attack: 0.05,
    breath: 0.04,
    volume: 0.42,
    scoop: 0.35,
    room: 0.35,
    detune: 3,
    decay: 10,
    bite: 0.6
  },
  sax: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 3200,
    overtone: 0.2,
    release: 0.12,
    sustain: 0.8,
    vibrato: 0.4,
    attack: 0.04,
    breath: 0.22,
    volume: 0.38,
    body: "reed",
    scoop: 0.4,
    bite: 0.35,
    room: 0.45,
    detune: 4,
    decay: 10
  },
  flute: {
    ...PLAIN_SOUND,
    brightness: 6000,
    waveform: "sine",
    overtone: 0.25,
    release: 0.15,
    vibrato: 0.35,
    sustain: 0.9,
    attack: 0.06,
    breath: 0.35,
    volume: 0.42,
    scoop: 0.05,
    room: 0.45,
    detune: 2,
    decay: 10
  },
  choir: {
    ...PLAIN_SOUND,
    waveform: "sawtooth",
    brightness: 3200,
    body: "voice",
    release: 0.7,
    sustain: 0.9,
    vibrato: 0.3,
    breath: 0.08,
    overtone: 0,
    attack: 0.3,
    volume: 0.3,
    detune: 10,
    room: 0.65,
    voices: 3,
    decay: 10
  }
};

let SOUND_SETTINGS = loadSoundSettings();

const BODIES = {
  plain: [],
  wood: [
    { type: "peaking", frequency: 220, Q: 1.2, gain: 5 },
    { type: "peaking", frequency: 1800, Q: 1.5, gain: 2 }
  ],
  strings: [
    { type: "highpass", frequency: 110, Q: 0.7 },
    { type: "peaking", frequency: 450, Q: 1.2, gain: 4 },
    { type: "peaking", frequency: 2600, Q: 1.4, gain: 5 }
  ],
  reed: [
    { type: "peaking", frequency: 600, Q: 1.3, gain: 4 },
    { type: "peaking", frequency: 1500, Q: 1.6, gain: 6 }
  ],
  brass: [
    { type: "peaking", frequency: 1200, Q: 1, gain: 5 }
  ],
  mute: [
    { type: "highpass", frequency: 700, Q: 0.7 },
    { type: "peaking", frequency: 1700, Q: 3, gain: 12 }
  ],
  voice: [
    { type: "highpass", frequency: 160, Q: 0.7 },
    { type: "peaking", frequency: 750, Q: 5, gain: 12 },
    { type: "peaking", frequency: 1150, Q: 6, gain: 9 },
    { type: "peaking", frequency: 2700, Q: 6, gain: 6 }
  ]
};

const SOUND_SLIDERS = [
  { name: "volume", min: 0, max: 1, step: 0.01 },
  { name: "brightness", min: 300, max: 12000, step: 100, unit: " Hz" },
  { name: "attack", min: 0.001, max: 1, step: 0.001, unit: " s" },
  { name: "decay", min: 0.05, max: 10, step: 0.05, unit: " s" },
  { name: "sustain", min: 0, max: 1, step: 0.01 },
  { name: "release", min: 0.01, max: 2, step: 0.01, unit: " s" },
  { name: "overtone", min: 0, max: 1, step: 0.01 },
  { name: "detune", min: 0, max: 25, step: 1, unit: " ¢" },
  { name: "voices", min: 1, max: 3, step: 1 },
  { name: "vibrato", min: 0, max: 1, step: 0.01 },
  { name: "tremolo", min: 0, max: 1, step: 0.01 },
  { name: "bite", min: 0, max: 1, step: 0.01 },
  { name: "breath", min: 0, max: 1, step: 0.01 },
  { name: "scoop", min: 0, max: 1, step: 0.01 },
  { name: "room", min: 0, max: 1, step: 0.01 }
];

const WAVEFORMS = [ "sine", "triangle", "square", "sawtooth", "pluck" ];
const SLIDE_SEMITONES = { fall: -7, rise: 7 };

function loadSoundSettings() {
  try {
    const saved = JSON.parse( localStorage.getItem( "sound" ) );
    return { preset: "piano", ...SOUND_PRESETS.piano, ...saved };
  } catch {
    return { preset: "piano", ...SOUND_PRESETS.piano };
  }
}

function frequencyOf( midi ) {
  return 440 * Math.pow( 2, ( midi - 69 ) / 12 );
}

function roomEchoSamplesOf( length, channel ) {
  const key = `${ length } ${ channel }`;
  ROOM_ECHO_SAMPLES[ key ] ??= Float32Array.from( { length }, ( _, idx ) => (
    Math.random() * 2 - 1 ) * Math.pow( 1 - idx / length, 3 ) );
  return ROOM_ECHO_SAMPLES[ key ];
}

function roomEchoOf( context ) {
  const seconds = 2.2;
  const length = context.sampleRate * seconds;
  const echo = context.createBuffer( 2, length, context.sampleRate );
  for ( let channel = 0; channel < 2; ++channel ) {
    echo.copyToChannel(
      roomEchoSamplesOf( echo.length, channel ),
      channel
    );
  }
  return echo;
}

function buildMix( context ) {
  const room = context.createConvolver();
  const compressor = context.createDynamicsCompressor();
  const master = context.createGain();
  room.buffer = roomEchoOf( context );
  room.connect( compressor );
  compressor.connect( master );
  master.gain.value = masterGainOf( MASTER_VOLUME );
  master.connect( context.destination );
  return {
    room,
    master,
    context,
    voices: [],
    compressor,
    noise: null,
    plucks: new Map()
  };
}

function soundOfVoice( voice ) {
  return voice.instrument
    ? SOUND_PRESETS[ voice.instrument ]
    : SOUND_SETTINGS;
}

function buildVoice( mix, instrument = null ) {
  const { context } = mix;
  const voice = {
    tone: context.createBiquadFilter(),
    input: context.createGain(),
    dry: context.createGain(),
    wet: context.createGain(),
    instrument,
    mix
  };
  const body = BODIES[ soundOfVoice( voice ).body ] || [];
  const filters = body.map(
    shape =>
      Object.assign(
        context.createBiquadFilter(),
        { type: shape.type }
      )
  );
  filters.forEach( ( filter, idx ) => {
    filter.frequency.value = body[ idx ].frequency;
    filter.Q.value = body[ idx ].Q;
    filter.gain.value = body[ idx ].gain || 0;
  });
  voice.tone.type = "lowpass";
  [ voice.input, ...filters, voice.tone ].reduce(
    ( from, to ) => from.connect( to )
  );
  voice.tone.connect( voice.dry );
  voice.tone.connect( voice.wet );
  voice.dry.connect( mix.compressor );
  voice.wet.connect( mix.room );
  setLiveSettings( voice );
  mix.voices.push( voice );
  return voice;
}

function liveSettingsOf( voice ) {
  const sound = soundOfVoice( voice );
  return [
    [ voice.input.gain, sound.volume * 0.4 ],
    [ voice.tone.frequency, sound.brightness ],
    [ voice.dry.gain, 1 - sound.room * 0.4 ],
    [ voice.wet.gain, sound.room * 0.7 ]
  ];
}

function setLiveSettings( voice ) {
  liveSettingsOf( voice ).forEach(
    ([ parameter, value ]) =>
      { parameter.value = value; }
  );
}

function applyLiveSettings( mix ) {
  if ( !mix )
    return;
  const now = mix.context.currentTime;
  const update = ([ parameter, value ]) =>
    parameter.setTargetAtTime( value, now, 0.03 );
  mix.voices.filter( voice => !voice.instrument )
            .forEach(
              voice =>
                liveSettingsOf( voice ).forEach( update )
            );
}

function noiseOf( mix ) {
  if ( mix.noise )
    return mix.noise;
  const { context } = mix;
  const noise_length = context.sampleRate * 2;
  mix.noise = context.createBuffer( 1, noise_length, context.sampleRate );
  const samples = Float32Array.from(
    { length: mix.noise.length },
    () => Math.random() * 2 - 1
  );
  mix.noise.copyToChannel( samples, 0 );
  return mix.noise;
}

function pluckedStringOf( mix, midi, sound ) {
  const key = `${ midi } ${ sound.decay } ${ sound.brightness }`;
  if ( mix.plucks.has( key ) )
    return mix.plucks.get( key );
  const { context } = mix;
  const rate = context.sampleRate;
  const period = Math.max( 2, Math.round( rate / frequencyOf( midi ) ) );
  const length = Math.round( rate * Math.min( 6, sound.decay * 1.5 + 0.3 ) );
  const samples = new Float32Array( length );
  const loss = Math.pow( 0.001, period / ( sound.decay * rate ) );
  const brightness = 0.5 + 0.45 * Math.min( 1, sound.brightness / 12000 );
  let smoothed = 0;
  for ( let idx = 0; idx < period; ++idx ) {
    smoothed += ( Math.random() * 2 - 1 - smoothed ) * brightness;
    samples[ idx ] = smoothed;
  }
  for ( let idx = period; idx < length; ++idx ) {
    const before = samples[ idx - period - 1 ] ?? 0;
    samples[ idx ] = loss * (
      brightness * samples[ idx - period ] + ( 1 - brightness ) * before
    );
  }
  const buffer = context.createBuffer( 1, length, rate );
  buffer.copyToChannel( samples, 0 );
  const pluck_rate = frequencyOf( midi ) * ( period + 1 - brightness ) / rate;
  const plucked = { buffer, rate: pluck_rate };
  mix.plucks.set( key, plucked );
  return plucked;
}

function wobble( context, rate, depth, from, until, parameter ) {
  const swing = context.createOscillator();
  const amount = context.createGain();
  swing.frequency.value = rate;
  amount.gain.setValueAtTime( 0, from );
  amount.gain.linearRampToValueAtTime( depth, from + 0.35 );
  swing.connect( amount );
  amount.connect( parameter );
  swing.start( from );
  swing.stop( until );
}

function slideTo( parameter, ratio, from, to ) {
  parameter.setValueAtTime( parameter.value, from );
  parameter.exponentialRampToValueAtTime( parameter.value * ratio, to );
}

function sourcesOfNote( voice, midi, sound ) {
  const { context } = voice.mix;
  if ( sound.waveform === "pluck" ) {
    const plucked = pluckedStringOf( voice.mix, midi, sound );
    const source = context.createBufferSource();
    source.buffer = plucked.buffer;
    source.playbackRate.value = plucked.rate;
    return [{
      pitch: source.playbackRate,
      tuning: source.detune,
      level: 2,
      source
    }];
  }
  const voices = Math.round( sound.voices );
  const bodies = Array.from(
    { length: voices },
    ( _, idx ) => {
      const source = context.createOscillator();
      source.type = sound.waveform;
      source.frequency.value = frequencyOf( midi );
      source.detune.value = voices > 1
        ? ( idx - ( voices - 1 ) / 2 ) * sound.detune
        : 0;
      return {
        level: 1 / Math.sqrt( voices ),
        pitch: source.frequency,
        tuning: source.detune,
        source
      };
    }
  );
  if ( sound.overtone <= 0 )
    return bodies;
  const overtone = context.createOscillator();
  overtone.frequency.value = frequencyOf( midi ) * 2;
  overtone.detune.value = sound.detune;
  return [
    ...bodies,
    {
      level: sound.overtone * 0.5,
      pitch: overtone.frequency,
      tuning: overtone.detune,
      source: overtone
    }
  ];
}

function addBreath( voice, midi, sound, time, until, envelope ) {
  const { context } = voice.mix;
  const noise = context.createBufferSource();
  const band = context.createBiquadFilter();
  const level = context.createGain();
  noise.buffer = noiseOf( voice.mix );
  noise.loop = true;
  noise.loopStart = Math.random();
  band.type = "bandpass";
  const band_center = frequencyOf( midi ) * 2;
  band.frequency.value = Math.min( 6000, Math.max( 900, band_center ) );
  band.Q.value = 0.9;
  level.gain.setValueAtTime( sound.breath * 1.2, time );
  level.gain.setTargetAtTime( sound.breath * 0.45, time + 0.02, 0.06 );
  noise.connect( band );
  band.connect( level );
  level.connect( envelope );
  noise.start( time, noise.loopStart );
  noise.stop( until );
}

function addBite( context, midi, sound, time, attack_end ) {
  const filter = context.createBiquadFilter();
  const base = frequencyOf( midi );
  const limit = context.sampleRate / 2 - 100;
  filter.type = "lowpass";
  filter.Q.value = 1 + sound.bite * 2;
  const open_width = 1.5 + sound.bite * 14;
  const closed_width = 1.5 + sound.bite * 5;
  filter.frequency.setValueAtTime( Math.min( limit, base * 1.5 ), time );
  filter.frequency.linearRampToValueAtTime(
    Math.min(
      limit, base * open_width
    ),
    attack_end + 0.04
  );
  filter.frequency.setTargetAtTime(
    Math.min( limit, base * closed_width ),
    attack_end + 0.04, 0.25
  );
  return filter;
}

function scheduleNote( pitch, time, duration, voice, style = {} ) {
  const { context } = voice.mix;
  const sound = soundOfVoice( voice );
  const midi = midiOf( pitch );
  const attack_end = time + sound.attack;
  const end = time + Math.max( duration, sound.attack );
  const until = end + sound.release * 1.5 + 0.05;
  const { envelope, release } = makeNoteEnvelope(
    context, voice, sound, midi, time,
    attack_end, end, style
  );
  const shaped = sound.bite > 0
    ? addBite(
        context, midi, sound,
        time, attack_end
      )
    : null;
  const tremolo = sound.tremolo > 0 ? context.createGain() : null;
  const chain = [ envelope, shaped, tremolo, release ].filter( Boolean );
  chain.reduce( ( from, to ) => from.connect( to ) );
  if ( tremolo ) {
    tremolo.gain.value = 1 - sound.tremolo * 0.4;
    wobble(
      context, 4.8, sound.tremolo * 0.4,
      time, until, tremolo.gain
    );
  }
  scheduleNoteSources(
    context, envelope, voice, sound, midi, time,
    duration, attack_end, end, until, style
  );

  if ( sound.breath > 0 && sound.waveform !== "pluck" )
    addBreath( voice, midi, sound, time, until, envelope );

  return {
    letGo: () =>
             release.gain.setTargetAtTime(
               0,
               context.currentTime,
               0.05
             )
  };
}

function makeNoteEnvelope(
  context, voice, sound, midi,
  time, attack_end, end,
  style
) {
  const decay_time = sound.decay * ( 1.4 - midi / 127 );
  const peak = style.loudness ?? 1;
  const sustain = style.held
    ? Math.max( sound.sustain, 0.6 )
    : sound.sustain;

  const release = context.createGain();
  release.connect( voice.input );

  const envelope = context.createGain();
  envelope.gain.setValueAtTime( 0, time );
  envelope.gain.linearRampToValueAtTime( peak, attack_end );
  if ( sound.waveform !== "pluck" ) {
    envelope.gain.setTargetAtTime(
      Math.max( sustain * peak, 0.0001 ),
      attack_end,
      decay_time / 3
    );
  }
  envelope.gain.setTargetAtTime( 0, end, sound.release / 4 );
  return { envelope, release };
}

function scheduleNoteSources(
  context, envelope, voice, sound,
  midi, time, duration,
  attack_end, end,
  until, style
) {
  const sources = sourcesOfNote( voice, midi, sound );
  sources.forEach(
    ({ source, pitch: frequency, tuning, level }) => {
      const gain = context.createGain();
      gain.gain.value = level;
      source.connect( gain );
      gain.connect( envelope );
      if ( sound.scoop > 0 ) {
        tuning.setValueAtTime( tuning.value - sound.scoop * 120, time );
        tuning.linearRampToValueAtTime(
          tuning.value,
          time + 0.05 + sound.scoop * 0.07
        );
      }
      if ( sound.vibrato > 0 ) {
        wobble(
          context, 5.4,
          sound.vibrato * 35,
          time + 0.12,
          until,
          tuning
        );
      }
      if ( style.slide ) {
        const slide_time = Math.max(
          attack_end,
          end - Math.min( 0.35, duration * 0.4 )
        );
        slideTo(
          frequency,
          Math.pow( 2, SLIDE_SEMITONES[ style.slide ] / 12 ),
          slide_time,
          end
        );
      }
      source.start( time );
      source.stop( until );
    }
  );
}

function previewSound() {
  ensureAudioContext();
  const mix = buildMix( AUDIO_CONTEXT );
  const voice = buildVoice( mix );
  const start = AUDIO_CONTEXT.currentTime + 0.05;
  const chord = [ [ "c", 4 ], [ "e", 4 ], [ "g", 4 ], [ "c", 5 ] ];
  chord.forEach( ( [ letter, octave ], idx ) => {
    const when = start + idx * 0.18;
    scheduleNote(
      { letter, alter: 0, octave },
      when, 1.2 - idx * 0.18, voice
    );
  });
  const preview_time = ( 2.4 + SOUND_SETTINGS.release * 2 ) * 1000;
  setTimeout( () => fadeOutAndRelease( mix ), preview_time );
}
