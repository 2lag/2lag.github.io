const DROPDOWNS = [];

function labelOf( select ) {
  return select.selectedOptions[ 0 ]?.textContent ?? "";
}

function showChoice( entry ) {
  entry.button.textContent = labelOf( entry.select );
}

function refreshDropdowns() {
  DROPDOWNS.forEach( showChoice );
}

function closeDropdowns() {
  DROPDOWNS.forEach( entry => entry.dropdown.classList.remove( "open" ) );
}

function choose( entry, value ) {
  closeDropdowns();
  entry.select.value = value;
  entry.select.dispatchEvent( new Event( "change", { bubbles: true } ) );
  showChoice( entry );
}

function choiceOf( entry, option ) {
  const choice = document.createElement( "button" );
  choice.type = "button";
  choice.className = "dropdownOption";
  choice.textContent = option.textContent;
  choice.classList.toggle( "chosen", option.selected );
  choice.addEventListener( "click",
    event => {
      event.stopPropagation();
      choose( entry, option.value );
    }
  );
  return choice;
}

function openDropdown( entry ) {
  const choices = [ ...entry.select.options ].map(
    option => choiceOf( entry, option )
  );
  entry.list.replaceChildren( ...choices );
  entry.dropdown.classList.add( "open" );
  const is_chosen = choice => choice.classList.contains( "chosen" );
  const chosen = choices.find( is_chosen );
  chosen?.scrollIntoView({ block: "nearest" });
}

function toggleDropdown( entry ) {
  const opening = !entry.dropdown.classList.contains( "open" );
  closeDropdowns();
  if ( opening )
    openDropdown( entry );
}

function buildDropdown( select ) {
  const dropdown = document.createElement( "span" );
  const button = document.createElement( "button" );
  const list = document.createElement( "span" );
  const entry = { select, dropdown, button, list };
  dropdown.className = "dropdown";
  button.className = "dropdownButton";
  button.type = "button";
  list.className = "dropdownList";
  dropdown.append( button, list );
  select.after( dropdown );
  button.addEventListener( "click",
    event => {
      event.stopPropagation();
      toggleDropdown( entry );
    }
  );
  select.addEventListener( "change", () => showChoice( entry ) );
  DROPDOWNS.push( entry );
  showChoice( entry );
}

document.addEventListener( "DOMContentLoaded", () => {
  [
    SAMPLE_PICKER, PRESET_PICKER,
    WAVEFORM_PICKER, BODY_PICKER
  ].forEach( buildDropdown );
});

document.addEventListener( "click", closeDropdowns );
document.addEventListener( "keydown",
  event => {
    if ( event.key !== "Escape" )
      return;
    closeDropdowns();
  }
);
