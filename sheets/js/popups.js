const POPUPS = [ VOLUME_POPUP, SWING_POPUP ];

function closePopups() {
  POPUPS.forEach( popup => popup.classList.remove( "open" ) );
}

function togglePopup( popup ) {
  const opening = !popup.classList.contains( "open" );
  closePopups();
  SOUND_PANEL.classList.remove( "open" );
  closeExportMenu();
  closeLookMenu();
  popup.classList.toggle( "open", opening );
}

VOLUME_BUTTON.addEventListener( "click",
  event => {
    event.stopPropagation();
    togglePopup( VOLUME_POPUP );
  }
);

SWING_BUTTON.addEventListener( "click",
  event => {
    event.stopPropagation();
    togglePopup( SWING_POPUP );
  }
);

document.addEventListener( "click",
  event => {
    if ( !POPUPS.some( popup => popup.contains( event.target ) ) )
      closePopups();
  }
);
