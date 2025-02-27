/**
 * @author James Baicoianu / http://www.baicoianu.com/ ( Original )
 * @author day / https://kuso.day/ ( Modified & JS Port )
 */

import * as THREE from "three";

const UPDATE_TIME = 1 / 60;
const JOYSTICK_SENS = 0.01;

let control_checkbox,
    ctl_container,
    fwd_btn, back_btn,
    left_btn, right_btn,
    joystick, joystick_bound;

const x_axis = new THREE.Vector3( 1, 0, 0 );
const y_axis = new THREE.Vector3( 0, 0, 1 );
const HALF_PI = Math.PI * 0.5;
let joystick_interval = null;
let last_event = null;

export class CamCtl {
  constructor( camera, domElement ) {
    this.domElement = domElement;
    this.camera = camera;
    
    this.pitch = 0;
    this.hotkeys = { };
    this.rollSpeed = 0.005;
    this.movementSpeed = 50;
    this.movementSpeedMultiplier = 1;
    this.moveVector = new THREE.Vector3( );
    this.rotationVector = new THREE.Vector3( );
    this.tmpQuaternion = new THREE.Quaternion( );

    this.moveState = {
      up: 0, down: 0,
      left: 0, right: 0,
      fwd: 0, back: 0
    };
    
    this._mousemove = this.bind( this, this.mousemove );
    this._mousedown = this.bind( this, this.mousedown );
    this._keydown = this.bind( this, this.keydown );
    this._keyup = this.bind( this, this.keyup );

    this.domElement.addEventListener( "contextmenu", this.contextmenu, false );
    this.domElement.addEventListener( "mousemove", this._mousemove, false );
    this.domElement.addEventListener( "mousedown", this._mousedown, false );
    this.domElement.addEventListener( "mouseup", this._mouseup, false );
    
    function ptrLock( ) {
      this.controlsFocused = document.pointerLockElement === this.domElement;
    }
    
    document.addEventListener( "pointerlockchange", ptrLock.bind( this ), false );
    document.addEventListener( "mozpointerlockerror", ptrLock.bind( this ), false );

    window.addEventListener( "keydown", this._keydown, false );
    window.addEventListener( "keyup", this._keyup, false );

    this.updateMovementVector( );
    this.controlsFocused = false;

    window.addEventListener( "vmm", this._virtualMousemove.bind( this ), false );
  }

  _virtualMousemove( event ) {
    const { movementX, movementY } = event.detail;
    
    this.camera.rotateOnAxis( x_axis, this.limitPitch( movementY, true ) );
    this.camera.rotateOnWorldAxis( y_axis, movementX );
  }

  keydown( event ) {
    if ( event.altKey )
      return;

    switch( event.keyCode ) {
    /*shift*/case 16: this.movementSpeedMultiplier = 3; break;
    /*lctrl*/case 17: this.moveState.down = 1; break;
    /*space*/case 32: this.moveState.up = 1; break;
    /*w*/case 87: this.moveState.fwd = 1; break;
    /*a*/case 83: this.moveState.back = 1; break;
    /*s*/case 65: this.moveState.left = 1; break;
    /*d*/case 68: this.moveState.right = 1; break;
    /*f*/case 70: this.toggleFullscreen( ); break;
    }

    if ( this.hotkeys[ event.keyCode ] )
      this.hotkeys[ event.keyCode ]( );

    this.updateMovementVector( );
    event.preventDefault( );
  }

  keyup( event ) {
    switch( event.keyCode ) {
    /*shift*/case 16: this.movementSpeedMultiplier = 1; break;
    /*lctrl*/case 17: this.moveState.down = 0; break;
    /*space*/case 32: this.moveState.up = 0; break;
    /*w*/case 87: this.moveState.fwd = 0; break;
    /*a*/case 83: this.moveState.back = 0; break;
    /*s*/case 65: this.moveState.left = 0; break;
    /*d*/case 68: this.moveState.right = 0; break;
    }

    this.updateMovementVector( );
    event.preventDefault( );
  }

  mousedown( event ) {
    this.domElement.requestPointerLock( );
    event.preventDefault( );
    event.stopPropagation( );
  }

  mousemove( event ) {
    if ( !this.controlsFocused )
      return;

    this.camera.rotateOnAxis( x_axis, this.limitPitch( event.movementY, false ) );
    this.camera.rotateOnWorldAxis( y_axis, event.movementX * -0.002 );
  }

  limitPitch( movementY, virtual ) {
    const movement = movementY * ( virtual ? 1.2 : -0.002 );

    const new_pitch = THREE.MathUtils.clamp(
      this.pitch + movement,
      -HALF_PI, HALF_PI
    );

    const clamped_delta = new_pitch - this.pitch;
    this.pitch = new_pitch;
    return clamped_delta;
  }

  toggleFullscreen( ) {
    if ( document.fullscreenElement ) {
      document.exitFullscreen( );
      return;
    }

    this.domElement.requestPointerLock( );
    this.domElement.requestFullscreen( ).catch( ( err ) => {
      alert( `Error enabling fullscreen: ${ err.message } ( ${ err.name } )`)
    });
  }

  registerHotkey( keyCode, callback ) {
    this.hotkeys[ keyCode ] = callback;
  }

  update( delta ) {
    let moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;
    let rotMult = delta * this.rollSpeed;

    this.camera.translateX( this.moveVector.x * moveMult );
    this.camera.translateY( this.moveVector.y * moveMult );
    this.camera.translateZ( this.moveVector.z * moveMult );
    
    this.tmpQuaternion.set(
      this.rotationVector.x * rotMult,
      this.rotationVector.y * rotMult,
      this.rotationVector.z * rotMult,
      1
    ).normalize( );

    this.camera.quaternion.multiply( this.tmpQuaternion );
    this.camera.rotation.setFromQuaternion(
      this.camera.quaternion,
      this.camera.rotation.order
    );
  }

  updateMovementVector( ) {
    const x = this.moveState.right - this.moveState.left;
    const y = this.moveState.up - this.moveState.down;
    const z = this.moveState.back - this.moveState.fwd;

    this.moveVector.set( x, y, z );
  }

  bind( scope, fn ) {
    return function ( ) {
      fn.apply( scope, arguments );
    };
  }

  contextmenu( event ) {
    event.preventDefault( );
  }

  dispose( ) {
    this.domElement.removeEventListener( "contextmenu", this.contextmenu, false );
    this.domElement.removeEventListener( "mousedown", this._mousedown, false );
    this.domElement.removeEventListener( "mousemove", this._mousemove, false );

    window.removeEventListener( "keydown", this._keydown, false );
    window.removeEventListener( "keyup", this._keyup, false );
  }
};

function toggleOnScreenControls( e ) {
  ctl_container.classList.toggle( 'visible' );
}

function checkMobile( ) {
  let usr_agt = navigator.userAgent || navigator.vendor || window.opera;
  let r1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
  let r2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

  return r1.test( usr_agt ) || r2.test( usr_agt.substr( 0, 4 ) );
}

function handleStart( e ) {
  e.preventDefault( );
  joystick_bound.isActive = true;
  simulateMouse( e );
  last_event = e;

  joystick_interval = setInterval( ( ) => {
    simulateMouse( last_event );
  }, UPDATE_TIME );
}

function handleMove( e ) {
  if ( !joystick_bound.isActive )
    return;

  e.preventDefault( );
  simulateMouse( e );
  last_event = e;
}

function handleEnd( e ) {
  e.preventDefault( );
  joystick_bound.isActive = false;
  clearInterval( joystick_interval );
  joystick.style.transform = 'translate( 0px, 0px )';

  joystick_interval = null;
}

function simulateMouse( e ) {
  const bound_rect = joystick_bound.getBoundingClientRect( );
  const joy_rect = joystick.getBoundingClientRect( );

  const bound_cx = bound_rect.left + bound_rect.width / 2;
  const bound_cy = bound_rect.top + bound_rect.height / 2;

  const current_x = e.clientX || ( e.touches && e.touches[ 0 ].clientX );
  const current_y = e.clientY || ( e.touches && e.touches[ 0 ].clientY );

  if ( !current_x || !current_y )
    return;

  const max_r = ( bound_rect.width - joy_rect.width ) / 2;
  let dx = current_x - bound_cx;
  let dy = current_y - bound_cy;

  const d = Math.sqrt( dx * dx + dy * dy );

  if ( d > max_r ) {
    const ang = Math.atan2( dy, dx );
    dx = Math.cos( ang ) * max_r;
    dy = Math.sin( ang ) * max_r;
  }

  joystick.style.transform = `translate( ${ dx }px, ${ dy }px )`;

  const movementX = dx / max_r * -JOYSTICK_SENS;
  const movementY = dy / max_r * -JOYSTICK_SENS;

  const ce = new CustomEvent( 'vmm', {
    detail: { movementY, movementX },
    bubbles: true
  });

  window.dispatchEvent( ce );
}

function simulateKeyEvent( type, key, keyCode ) {
  let event = new KeyboardEvent( type, { key, keyCode, bubbles: true } );
  window.dispatchEvent( event );
}

document.addEventListener( "DOMContentLoaded", ( ) => {
  joystick_bound = document.getElementById( 'joystick_outer' );
  ctl_container = document.getElementById( 'ctl_container' );
  control_checkbox = document.getElementById( 'mobile' );
  right_btn = document.getElementById( 'right_btn' );
  joystick = document.getElementById( 'joystick' );
  left_btn = document.getElementById( 'left_btn' );
  back_btn = document.getElementById( 'back_btn' );
  fwd_btn = document.getElementById( 'fwd_btn' );

  control_checkbox.onclick = toggleOnScreenControls;

  right_btn.addEventListener( "mousedown", ( ) => simulateKeyEvent( "keydown", "d", 68 ) );
  left_btn.addEventListener( "mousedown", ( ) => simulateKeyEvent( "keydown", "a", 65 ) );
  back_btn.addEventListener( "mousedown", ( ) => simulateKeyEvent( "keydown", "s", 83 ) );
  fwd_btn.addEventListener( "mousedown", ( ) => simulateKeyEvent( "keydown", "w", 87 ) );

  right_btn.addEventListener( "mouseleave", ( ) => simulateKeyEvent( "keyup", "d", 68 ) );
  left_btn.addEventListener( "mouseleave", ( ) => simulateKeyEvent( "keyup", "a", 65 ) );
  back_btn.addEventListener( "mouseleave", ( ) => simulateKeyEvent( "keyup", "s", 83 ) );
  fwd_btn.addEventListener( "mouseleave", ( ) => simulateKeyEvent( "keyup", "w", 87 ) );
  
  right_btn.addEventListener( "mouseup", ( ) => simulateKeyEvent( "keyup", "d", 68 ) );
  left_btn.addEventListener( "mouseup", ( ) => simulateKeyEvent( "keyup", "a", 65 ) );
  back_btn.addEventListener( "mouseup", ( ) => simulateKeyEvent( "keyup", "s", 83 ) );
  fwd_btn.addEventListener( "mouseup", ( ) => simulateKeyEvent( "keyup", "w", 87 ) );

  right_btn.addEventListener( "touchstart", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keydown", "d", 68 );
  });
  left_btn.addEventListener( "touchstart", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keydown", "a", 65 );
  });
  back_btn.addEventListener( "touchstart", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keydown", "s", 83 );
  });
  fwd_btn.addEventListener( "touchstart", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keydown", "w", 87 );
  });
  right_btn.addEventListener( "touchend", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keyup", "d", 68 );
  });
  left_btn.addEventListener( "touchend", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keyup", "a", 65 );
  });
  back_btn.addEventListener( "touchend", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keyup", "s", 83 );
  });
  fwd_btn.addEventListener( "touchend", ( e ) => {
    e.preventDefault( );
    simulateKeyEvent( "keyup", "w", 87 );
  });

  joystick_bound.addEventListener( 'touchstart', handleStart, false );
  joystick_bound.addEventListener( 'touchcancel', handleEnd, false );
  joystick_bound.addEventListener( 'touchmove', handleMove, false );
  joystick_bound.addEventListener( 'touchend', handleEnd, false );

  joystick_bound.addEventListener( 'mousedown', handleStart, false );
  joystick_bound.addEventListener( 'mousemove', handleMove, false );
  joystick_bound.addEventListener( 'mouseleave', handleEnd, false );
  joystick_bound.addEventListener( 'mouseup', handleEnd, false );

  if ( checkMobile( ) )
    control_checkbox.click( );
});
