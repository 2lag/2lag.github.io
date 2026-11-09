const SAVED_ERA = localStorage.getItem( "era" );
const ERAS = [ "1.0", "2.0", "3.0", "4.0" ];
const DAY_ONLY_ERAS = [ "1.0", "2.0" ];
const SYSTEM_DARK = matchMedia( "(prefers-color-scheme: dark)" );

function savedTheme() {
  const theme = localStorage.getItem( "theme" );
  if ( theme === "day" || theme === "night" ) return theme;
  return SYSTEM_DARK.matches
    ? "night"
    : "day";
}

const LOOK = {
  theme: savedTheme(),
  era: ERAS.includes( SAVED_ERA )
    ? SAVED_ERA
    : "4.0"
};

function applyTheme() {
  const day_only = DAY_ONLY_ERAS.includes( LOOK.era );
  document.body.classList.toggle(
    "dark",
    LOOK.theme === "night" && !day_only
  );
  THEME_BUTTON.hidden = day_only;
}

function applyEra() {
  ERA_STYLE.href = `css/web${ LOOK.era[ 0 ] }.css`;
  ERA_BUTTON.textContent = LOOK.era;
  applyTheme();
}

THEME_BUTTON.addEventListener( "click",
  () => {
    LOOK.theme = LOOK.theme === "night"
      ? "day"
      : "night";
    localStorage.setItem( "theme", LOOK.theme );
    applyTheme();
  }
);

ERA_BUTTON.addEventListener( "click",
  () => {
    const next = (
      ERAS.indexOf( LOOK.era ) + 1
    ) % ERAS.length;
    LOOK.era = ERAS[ next ];
    localStorage.setItem( "era", LOOK.era );
    applyEra();
  }
);

SYSTEM_DARK.addEventListener( "change",
  () => {
    LOOK.theme = savedTheme();
    applyTheme();
  }
);

applyEra();
