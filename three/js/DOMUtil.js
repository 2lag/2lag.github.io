let dom_texture_showcase,
    dom_settings,
    dom_progress,
    dom_map_name,
    dom_wad_name,
    dom_error;

function setProgress( val ) {
  if ( !dom_progress || typeof val !== "number" )
    return;

  const value = Math.round( val );

  dom_progress.style.display = "block";
  dom_progress.value = value;

  if ( value === 100 )
    setTimeout( ( ) => { dom_progress.style.display = "none"; }, 50 );
}

function getProgress( ) {
  if ( !dom_progress )
    return 0;

  return dom_progress.value;
}

async function updateProgress( val ) {
  setProgress( val );
  await new Promise( r => setTimeout( r, 0 ) );
}

function hideProgress( ) {
  if ( !dom_progress )
    return;

  dom_progress.style.display = "none";
}

function setErrorMessage( msg ) {
  if ( !dom_error )
    return;

  dom_error.style.display = "flex";
  dom_error.innerText = msg;
  setTimeout( ( ) => { dom_error.style.display = "none"; }, 3333 );
}

function sortTexturesById( ) {
  if ( !dom_texture_showcase )
    return;

  const elements = Array.from( dom_texture_showcase.children );

  if ( !elements )
    return;

  elements.sort( ( a, b ) => {
    const id_a = a.id.toUpperCase( );
    const id_b = b.id.toUpperCase( );

    if ( id_a < id_b )
      return -1;
    
    if ( id_a > id_b )
      return  1;

    return 0;
  });

  for ( let e_idx = 0; e_idx < elements.length; ++e_idx )
    dom_texture_showcase.appendChild( elements[ e_idx ] );
}

function setHudNames( m, w ) {
  if ( !dom_map_name || !dom_wad_name )
    return;

  setMapName( m );
  setWadName( w );
}

function getWadName( ) {
  if ( !dom_wad_name )
    return "";

  return dom_wad_name.innerText;
}

function setWadName( name ) {
  if ( !dom_wad_name )
    return;

  dom_wad_name.innerText = name;
}

function getMapName( ) {
  if ( !dom_map_name )
    return "";

  return dom_map_name.innerText;
}

function setMapName( name ) {
  if ( !dom_map_name )
    return;

  dom_map_name.innerText = name;
}

function appendTexture( el ) {
  if ( !dom_texture_showcase )
    return;

  dom_texture_showcase.appendChild( el );
}

function clearTextures( ) {
  if ( !dom_texture_showcase )
    return;

  dom_texture_showcase.innerHTML = "";
}

function setTextureShowcaseHeight( height ) {
  if ( !dom_texture_showcase )
    return;

  dom_texture_showcase.style.height = height;
}

function toggleTextureShowcase( ) {
  if ( !dom_texture_showcase )
    return;

  dom_texture_showcase.classList.toggle( 'active' );
}

function toggleSettings( ) {
  if ( !dom_settings )
    return;
  
  dom_settings.classList.toggle( 'active' );
}

function isSettingsActive( ) {
  if ( !dom_settings )
    return false;
  
  return dom_settings.classList.contains( 'active' );
}

document.addEventListener( "DOMContentLoaded", ( ) => {
  dom_texture_showcase = document.getElementById( 'side_collapsible_section' );
  dom_settings = document.getElementById( 'bottom_collapsible_section' );
  dom_progress = document.getElementById( 'progress' );
  dom_map_name = document.getElementById( 'map_name' );
  dom_wad_name = document.getElementById( 'wad_name' );
  dom_error = document.getElementById( 'error' );
});

export {
  setProgress,
  getProgress,
  updateProgress,
  hideProgress,
  setErrorMessage,
  sortTexturesById,
  setHudNames,
  getWadName,
  setWadName,
  getMapName,
  setMapName,
  appendTexture,
  clearTextures,
  setTextureShowcaseHeight,
  toggleTextureShowcase,
  toggleSettings,
  isSettingsActive
};