const SAVED_ERA = localStorage.getItem( "era" );
const ERAS = [ "1.0", "2.0", "3.0", "4.0" ];

function applyTheme( theme ) {
  document.body.classList.toggle(
    "dark",
    theme === "night"
  );
}

function applyEra( era ) {
  ERA_STYLE.href = `css/web${ era[ 0 ] }.css`;
  ERA_BUTTON.textContent = era;
}

THEME_BUTTON.addEventListener( "click",
  () => {
    const theme = document.body.classList.contains( "dark" )
      ? "day"
      : "night";
    localStorage.setItem( "theme", theme );
    applyTheme( theme );
  }
);

ERA_BUTTON.addEventListener( "click",
  () => {
    const index = ERAS.indexOf( ERA_BUTTON.textContent );
    const next = ( index + 1 ) % ERAS.length;
    const era = ERAS[ next ];
    localStorage.setItem( "era", era );
    applyEra( era );
  }
);

applyTheme(
  localStorage.getItem( "theme" ) === "night"
    ? "night"
    : "day"
);

applyEra(
  ERAS.includes( SAVED_ERA )
    ? SAVED_ERA
    : "4.0"
);
