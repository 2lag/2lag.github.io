let SHOW_IN_C = localStorage.getItem( "showInC" ) === "on";

function showKeyButton() {
  KEY_BUTTON.classList.toggle( "on", SHOW_IN_C );
}

KEY_BUTTON.addEventListener( "click",
  () => {
    SHOW_IN_C = !SHOW_IN_C;
    localStorage.setItem( "showInC", SHOW_IN_C ? "on" : "off" );
    showKeyButton();
    renderScore( SHEET );
    if ( !PLAYING && PLAYBACK_POSITION > 0 )
      placePlayhead( PLAYBACK_POSITION, false );
  }
);

showKeyButton();
