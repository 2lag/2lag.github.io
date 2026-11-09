let SWING_AMOUNT = Number( localStorage.getItem( "swing" ) ) || 0.5;

function showSwing() {
  SWING_SLIDER.value = Math.round( SWING_AMOUNT * 100 );
  SWING_READOUT.textContent = SWING_AMOUNT > 0.5
    ? `${ SWING_SLIDER.value }%`
    : "off";
  SWING_BUTTON.classList.toggle( "on", SWING_AMOUNT > 0.5 );
}

SWING_SLIDER.addEventListener( "input",
  () => {
    SWING_AMOUNT = SWING_SLIDER.value / 100;
    localStorage.setItem( "swing", SWING_AMOUNT );
    showSwing();
    restartPlayback( true );
  }
);

showSwing();
