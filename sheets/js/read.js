let LATEST_REMEMBERED = 0;

function base64OfBytes( bytes ) {
  const chars = Array.from(
    bytes,
    byte => String.fromCharCode( byte )
  );
  return btoa( chars.join( "" ) );
}

function bytesOfBase64( encoded ) {
  const chars = atob( encoded );
  return Uint8Array.from(
    chars,
    character => character.charCodeAt( 0 )
  );
}

function base64Encode( text ) {
  return base64OfBytes(
    new TextEncoder().encode( text )
  );
}

function base64Decode( encoded ) {
  return new TextDecoder().decode(
    bytesOfBase64( encoded )
  );
}

function urlSafe( encoded ) {
  const swapped = encoded.replaceAll( "+", "-" ).replaceAll( "/", "_" );
  return swapped.replace( /=+$/, "" );
}

function fromUrlSafe( encoded ) {
  return encoded.replaceAll( "-", "+" ).replaceAll( "_", "/" );
}

async function compressedOf( text ) {
  const blob = new Blob([ text ]);
  const stream = blob.stream()
                     .pipeThrough(
                       new CompressionStream( "deflate-raw" )
                     );
  const bytes = new Uint8Array(
    await new Response( stream ).arrayBuffer()
  );
  return urlSafe( base64OfBytes( bytes ) );
}

async function decompressedOf( encoded ) {
  const bytes = bytesOfBase64( fromUrlSafe( encoded ) );
  const blob = new Blob([ bytes ]);
  const stream = blob.stream()
                     .pipeThrough(
                       new DecompressionStream( "deflate-raw" )
                     );
  return new Response( stream ).text();
}

async function sheetFromLink() {
  const parameters = new URLSearchParams( location.search );
  try {
    if ( parameters.has( "s" ) )
      return await decompressedOf( parameters.get( "s" ) );
    if ( parameters.has( "sheet" ) )
      return base64Decode( parameters.get( "sheet" ) );
  } catch {}
  return null;
}

async function loadSheet() {
  const text = await sheetFromLink()
            ?? localStorage.getItem( "sheet" );
  if ( !text )
    return;
  EDITOR.value = text;
}

async function shareLinkOf( text ) {
  const url = new URL( location );
  url.searchParams.delete( "sheet" );
  url.searchParams.set( "s", await compressedOf( text ) );
  return url;
}

function copyWithoutClipboard( text ) {
  if ( !document.queryCommandSupported?.( "copy" ) )
    return false;
  const field = document.createElement( "textarea" );
  field.value = text;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append( field );
  field.select();
  const copied = document.execCommand( "copy" );
  field.remove();
  return copied;
}

async function copyText( text ) {
  try {
    await navigator.clipboard.writeText( text );
    return true;
  } catch { return copyWithoutClipboard( text ); }
}

function saveLocally( text ) {
  try {
    localStorage.setItem( "sheet", text );
    return true;
  } catch {
    return false;
  }
}

async function rememberSheet( text ) {
  saveLocally( text );
  const attempt = ++LATEST_REMEMBERED;
  const link = await shareLinkOf( text );
  if ( attempt === LATEST_REMEMBERED )
    history.replaceState( null, "", link );
}

const SHEET_LOADED = loadSheet();
