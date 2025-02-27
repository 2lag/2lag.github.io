let lastUpdate = "02.27.25"
let commits = "363"
let visits = 1898; // count before it broke :( now we rng it lmfao
var enableKeys = false;
$( function() {
  $( document ).keydown( function( objEvent ) {
    if( objEvent.ctrlKey && !enableKeys ) {
      if( objEvent.shiftKey ) {
        if( objEvent.keyCode == 73 || objEvent.keyCode == 74 || objEvent.keyCode == 67 )
          return false; // CTRL + SHIFT + I / J / C
      } else {
        if( objEvent.keyCode == 65 || objEvent.keyCode == 85 )
          return false; // CTRL + A / U
      }
    }
    if( objEvent.keyCode == 123 )
		  return false;// F12
  });
});

var root = 0;
var MD5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

var pMusic = document.getElementById( "music" );
pMusic.volume = 0.25;
pMusic.load();
var pMusicPlaying = 0;

var pJesse = document.getElementById( "breakingbad" );
pJesse.volume = 0.4;
pJesse.loop = false;

var sMonth = [ "January","February","March","April","May","June","July","August","September","October","November","December" ];
const commands = {
  contact: {
    cmd: 'contact',
    res: `<span class="red">-----BEGIN PGP PUBLIC KEY BLOCK-----<br><br>
mQINBGX7TewBEADEXQcTW7SPvQE0PPSTQUDzJwvoQa9ot2AKZK9FEkVYRd2mhcPJ<br>
dzxylQjRxKCYuqWl9ZGoAht0DPy/QABNIh7ZYC+R6bXteMXRokkL2ASgkXt0YRPE<br>
QSYlDMNpoqHh1N+KVhl45mhqMM54SbrOS9BIlro1Fh7HvZSwzXOgDEx/AAY6F7Q8<br>
hqzR6K/aWARmy0NqsKwFtw8Eh1Uj5KR/h6KwOeenVUkOLs9RhQC1k1H62R3uCXBh<br>
2m5Ars9VjEeNFFZ/0H4t/etjTueanMgeN4j9jtzgds+wiO1v8BBQ9U5EiGj1QQ4S<br>
Nvi5XK/OWTZJH1rnmogBuIO/lvcmCUIKhGUKsB8RYvio+itrBeVRdSs0rZDuDZD+<br>
CDcMOY7c8PwbZaTIwb6aguQwuWq0yGPtrSWLQ/BhBQW/xjOJ+eL8l+VJf+ji26Nz<br>
nagM0Yi0gUsLqa0PGjZIDEtcRjO3ouCT6JGtHwt0tAz37/LQEHoV6WhQAXs6o88y<br>
kaEeWTIgEk0QC52aXB901fuQy0PoZL8v96hInmPZWUkGqu51avU/QpzTWF6Xtjys<br>
Iebkqalggvl/SEpWM0yfBBxbWXGOaCR9S8MJ4/IdE75zXer0eqL7U7pJu9y2Lwqj<br>
QjwsR9R6IXA4E62Cy2zOTVG70Pk3knSV6l2fYhI+zBuh2QzqxjfO3JZQfwARAQAB<br>
tCVkYXkgPGRheUBuYXRpb25hbC5zaGl0cG9zdGluZy5hZ2VuY3k+iQJXBBMBCABB<br>
FiEElTJNJ0+zMz6y8Vjcry/DdM+8tE4FAmX7TewCGwMFCQlobKQFCwkIBwICIgIG<br>
FQoJCAsCBBYCAwECHgcCF4AACgkQry/DdM+8tE7bYw//UgeHA4cqv8vbTQwUfJug<br>
Q1KdpVevzTBtyvCNCdIONcR5c4umc56EhV6m0l95Vnh0jVwh/Db4nlZnm6TfOs1i<br>
vV1Gri0M338a3/w/gsUIJGgxMuFK8CFT4gbNDwRDQa5kAFI5j5v3FNKGqZ+OUQGX<br>
sKhXBPzf2ac/tFGsPCSiS6w4l2b8gVhYOEz4xahpwEMN8rJ8zV4bV6LubZiVATfR<br>
VZzR148LGUSXvWKZ+xx4mBsZt20R5zX8WmhZ2mq0RBAf7Slf+KDmuU4UcuU6lVwI<br>
Jh9CgPAw10juT8AonYfZtXZ9yD0JCaaG9zHbqJWhEyQHEUP3HSxbgzg5qRhQOpoO<br>
cjk/GYeHc1S1bfINVJDGWJhD1stEstv2hpMeadz6g5cusvt6HqbsHnNueG1MJWcK<br>
Z6wRhkqsWZ6oLOGt1TtGWWQPfk6FlrudYTtDn6YeHjdqnl7ZeKD3xwEw4PBsqiHk<br>
gC3Yfd7lt0W+A4IMmi7VWDflPGuDXsilLkfMk5dOFdtY8Eopa1SySHYrsMzscdbz<br>
PjcTw4H9X1Lfe0UOth9F5L6AtEOGbDllRVMs2tytydgpWhPvdQRJqa9dljAsfJfH<br>
mfCjYKFqOWP7XXnzbmpHhnk+bUWU4qPdjspVvcRhyaCOshmggyXnX3de4Ytc57QT<br>
K2Ag74n9yroIJcSdC6s32Eq5Ag0EZftN7AEQAMymKSIdBCQIiDMRHRDKPiZF+p1h<br>
xTcJlbSij8ua3ZcoZx9Gx0x02VrHu3sSvd2e7uFHMjANjNHEXM9ESUolRYnYVP3f<br>
yq4/SXi9vnLt7mdR2jhSOcFZrkimgvnjZgWpfbPQ0iVWYYRjxq0YVUD+ReOXtLQZ<br>
pvK5EERIU4wYilTQ9c6YIB4M+6e1/tOAB64XWDup858+ZKUjbcQ/AHKkbqyAVO9v<br>
XHkxmS+oGnqCUxyoFmig9dBAMjcoOMlY/wZGUJ6m+bxvQwQp9liJ09GC3J9YpG7d<br>
4rzuOjepo1mSBuPlLMa1j+4gszu3iTMpHF9kQnvbTo5VmNuAoovqRIwhduTumQMg<br>
VgLTDQLxCm8TCU1CruoN59eBHmfmWE1ugIl9i0igs4bnbzDPV6xjt+C7mV2qeCfz<br>
ow0nLzjUto6lgzMkut/dhAyHUWemjkDQvvTK1/j1VK7M2A3V1RL3JOEv30wttIem<br>
tQQSddCSgg9aX/euhtTeEnpq23JULOcZGAc5aSQeqhkVanpZEos0eTCqkOnwIcaM<br>
0C7c8v9sVPouULQ+ADTq7jZ/0nEmV4AM6lAYP43CSwU1+IWdsDod1VyuOt/VTsWn<br>
PHqrodiOsGtgsDcHD75gGaZLBO4avDMNP+/f4xRzbmTGBy3aN9eozf/6XgMCalmq<br>
UARdIje0IbCjSEYzABEBAAGJAjwEGAEIACYWIQSVMk0nT7MzPrLxWNyvL8N0z7y0<br>
TgUCZftN7AIbDAUJCWhspAAKCRCvL8N0z7y0TkY0D/4w4IiMWAd3eZxDOYvQ87dq<br>
QVURqo9WifG7VpIOew8NOckFTQrmJzcbETfL80cJcEJcpZ9q7JKeVZFVehjk6uh+<br>
ketBYMwHcxBsNF415j6Bb5945GUGUBR/O4Y3xoCLXKFuFyVI0vboIFccOz3qSqHa<br>
Oi5jGxV/PCbMXn1eppWbYwRRwixAfdRHHCEuQdXUM8yKMQUwXCSzPBdVDl9gohas<br>
IfrWuTWbCjTk63U25byeDH7TitvxPZvu60HYX6ZVVIoBPd4tGXQ6Jx3c0ulOrTaA<br>
+BagYF6P/AwUWkYZxmpmVpB23PqluOCvXgjshSbxO5+oVOmk2PV8c2ltRZZYybuN<br>
sRmbGE3vN08YTTbxw2dLxDERTm7WzPSbdzmDXzA4TSydH7bgQgQj+LRT/P703cEY<br>
gRTh0saZZnMgs3575YOMFNxPfVTghBLnRxezsQ63YmPCsFD3ATt3Stw86XiCWQOl<br>
OcL51LX0CIghVk49xsh5kAUNPaeOdQEEo3HuPuRAJvWb3Tc3Ed2KA0XDaQ22d3CD<br>
SJ4fBxjIPec3WxL71bFmk72JDQ80zpuGVQu0VMViLKOeAjlvOrD3s8m3nnQ0gzwz<br>
oOOsE0pc/2cO4ckkAPl6xQsRNqmAUyV0Lpby5gO6+ndsY6z9YFOAA+AAd9dOlHAv<br>
9u570b58sk6DUMT1z8nGLQ==<br>
=F3NZ<br>
-----END PGP PUBLIC KEY BLOCK-----</span><br>
Email: <span class="red">day@national.shitposting.agency</span>`
  },
  work: {
    cmd: 'work',
    res: `Websites:<br>
# <span class="red"><a href="https://kuso.day/" target="_blank">kuso.day</a></span> - this one<br>
# <span class="red"><a href="https://kus.ooo" target="_blank">kus.ooo</a></span> - kuso clan<br>
# <span class="red"><a href="https://axonbox.net" target="_blank">axonbox</a></span> - LLM Hosting w/ OpenAPI compatible API<br>
# <span class="red"><a href="https://github.com/2lag/three" target="_blank">MapJS</a></span> - Quake/Valve .MAP Viewer<br>
# <span class="red"><a href="https://github.com/2lag/nohat.tv" target="_blank">nohat.tv </a></span>- old content group<span class="red"> offline </span><br>
<br>
Software:<br>
# <span class="red"><a href="https://github.com/2lag/CGUI" target="_blank">CGUI</a></span> - C++ Windows GUI base<br>
# <span class="red"><a href="https://github.com/2lag/edit" target="_blank">Edit</a></span> - C++ Text Editor<br>
<br>
Hardware:<br>
# <span class="red">PortaHak</span> - Portable Raspberry Pi hacking suite (WIP)<br>`
  },
  about: {
    cmd: 'about',
    res: `About Me:<br>
# <span class="red">Name:</span> Aiden<br>
# <span class="red">Born:</span> 2002 <span class="red">( ${ GetAge("2002-03-21") } )</span><br>
# <span class="red">Country:</span> United States<br>
<br>
<span class="red">Bio:</span><br>
<span class="pink">Dedicated developer holding Associate\'s of Applied Science for software development. Diverse work experience in IT, retail, and freelance development, complemented with educational and personal exposure to programming of all forms including: websites/web apps, smart contracts, Windows/Linux apps, etc.<br></span><br>
# <span class="red">Programming:</span> C/C++/C#, HTML, CSS, JavaScript, Electron, React(Native), Bash/Batch, PHP, SourcePawn, Python, Processing, Java, Solidity.<br></span><br>
# <span class="red">Extraneous Skills:</span> Graphic design, video editing, 3D modeling, auto mechanic.<br></span><br>
# <span class="red">Languages:</span> English, Spanish, Polish ( WIP ), Japanese ( WIP - Kanji ).<br>`
  },
  links: {
    cmd: 'links',
    res: `Links:<br>
# <span class="red"><a href="https://github.com/2lag/" target="_blank">github</a></span><br>
# <span class="red"><a href="https://instagram.com/kuso.day/" target="_blank">instagram</a></span><br>
# <span class="red"><a href="https://kus.ooo/" target="_blank">kus.ooo</a></span><br>
# <span class="red"><a href="https://youtube.com/@kusoclan" target="_blank">kuso youtube</a></span><br>
# <span class="red"><a href="https://www.youtube.com/@spasm" target="_blank">my youtube</a></span><br>
# <span class="red"><a href="https://soundcloud.com/author/likes" target="_blank">soundcloud</a></span><br>
# <span class="red"><a href="https://steamcommunity.com/id/bosozoku" target="_blank">steam</a></span><br>
# <span class="red"><a href="https://steamcommunity.com/tradeoffer/new/?partner=318481185&token=QAUufAgd" target="_blank">steam trade link</a></span><br>
# <span class="red"><a href="https://x.com/kusoday" target="_blank">x/twitter</a></span>`
  },
  stats: {
    cmd: 'stats',
    res: `Total commits: <span class="red">${ commits }</span><br>Last update: <span class="red">${ lastUpdate }</span>`
  },
  help: {
    cmd: 'help',
    res: `Available commands:<br>
# <span class="red">about</span> - Who I am/what I do. <br>
# <span class="red">clear</span> - Clears console. <br>
# <span class="red">jesse</span> - Yo yo yo 148 3 to the 3 to the 6 to the 9 <br>
# <span class="red">links</span> - Where to find me. <br>
# <span class="red">map</span> - Check out some Valve/Quake maps!<br>
# <span class="red">music</span> - Usage: music [play/stop/link]<br>
# <span class="red">stats</span> - Website statistics.<br>
# <span class="red">wad</span> - Work with some WAD3s.<br>
# <span class="red">work</span> - See the stuff I create!<br>
# <span class="red">contact</span> - Best way to contact me<br>`
  }
}

var prephraseRoot = '<span class="red">root@day</span>:<span class="blue">~</span># ';
var prephrase = '<span class="red">visitor@day</span>:<span class="blue">~</span># ';

var form = $('<div style="width: 100%;display: table"><div style="display: table-cell; width: 1%">' + prephrase + '</div>&nbsp<form id="form" style="display: table-cell; width :100%"><input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id="tCommand" type="text" maxlength="48" class="nostyle" autofocus /></form></div>').appendTo('#content');

function OnlyRoot( command ) {
  var res = '';
  res = '[ <span class="red">ERROR</span> ] This command can be run only as root!';
  $('<div>' + prephrase + command + '<p>' + res + '</p></div>').insertBefore( form );
}

function launchCommandAsRoot( command ) {
  var res = '';
  if( command === './welcome.sh' )
	  res = 'Welcome to <span class="red">my website</span>!<br><br>Total Visits: <span class="red">' + get_visits() + '</span><br>MOTD : <span class="red">Free Pavel Durov.</span><br>Terminal Updated: <span class="red">'+ lastUpdate +'</span><br><b>Type \'help\' for more details on the commands</b>'
  else {
    window.alert( "Nice try to changing \'root\' variable to 1" );
    window.location = "https://youtu.be/LDU_Txk06tM?t=75";
    res = "Nice try to changing \'root\' variable to 1.";
    command = command.cmd;
  }
  $('<div>' + prephraseRoot + command + '<p>' + res + '</p></div>').insertBefore( form );
}

function launchCommandAsVisitor( command ) {
  $('<div>' + prephrase + command.cmd + '<p>' + command.res + '</p></div>').insertBefore( form );
}

launchCommandAsRoot('./welcome.sh');

$('#content').niceScroll({
  cursorcolor: '#303030',
  cursorborder: '0px none',
  autohidemode: false,
  cursorwidth: "8px",
  cursorborderradius: "4px",
  railpadding: { top: 0, left: 0, right: 0, bottom: 10 }
});

function GetAge( dateString ) {
  var birthday = +new Date( dateString );
  return ~~( ( Date.now() - birthday ) / ( 31557600000 ) );
}

$('form').on('submit', function(e) {
  e.preventDefault();
  try {
    var vInput = $('input').val().toLowerCase();
    if( root > 0 )
      launchCommandAsRoot( commands[$('input').val()] );
    else {
      if( vInput.startsWith("./") ) {
        if( vInput === "./root/welcome.sh" )
          OnlyRoot( vInput );
        else {
          launchCommandAsVisitor({
            cmd: vInput,
            res: '<div><p>day: ' + vInput + ': No such file or directory</p></div>'
          });
        }
      } else if( vInput.startsWith("cd ") || vInput === "cd" || vInput.startsWith("mkdir ") || vInput === "mkdir" || vInput.startsWith("touch ") || vInput === "touch" || vInput.startsWith("rm ") || vInput === "rm" || vInput === "ls") {
        launchCommandAsVisitor({
          cmd: vInput,
          res: '<div><p>[ <span class="red">ERROR</span> ] Visitors can\'t use this type of command!</p></div>'
        });
      } else if( vInput.startsWith("su") ) {
        var loginArray = vInput.split(/(\s+)/);
        var res = '';
        if( typeof loginArray[2] !== "undefined" ) {
          if( loginArray[2] === "visitor" )
            res = '[ <span class="red">ERROR</span> ] You\'re already logged as Visitor!';
          else if( loginArray[2] === "root" ) {
            res = 'su: Authentication failure';
            if( typeof loginArray[4] !== "undefined" && MD5( loginArray[4] ) === "c4ca4238a0b923820dcc509a6f75849b" ) {
              root = 1;
              res = '';
            }
          } else
            res = 'day: No passwd entry for user ' + loginArray[2] + '';

          launchCommandAsVisitor({
            cmd: loginArray[0] + ' ' + loginArray[2],
            res: '<div><p>' + res + '</p></div>'
          });
          if( root > 0 )
            $('#content > *').not(':last').remove();
        } else {
          launchCommandAsVisitor({
            cmd: loginArray[0],
            res: '<div><p>' + res + '</p></div>'
          });
        }
      } else if( vInput === "jesse" ) {
        pJesse.load();
        pJesse.play();
        launchCommandAsVisitor({
          cmd: vInput,
          res: '<div><p>[ <span class="green">SUCCESS</span> ] Jesse playing!</p></div>'
        });
      } else if( vInput.startsWith("music") ) {
        if( vInput === "music play" ) {
          if( pMusicPlaying == 1 ) {
            launchCommandAsVisitor({
              cmd: vInput,
              res: '<div><p>[ <span class="red">ERROR</span> ] Music is already playing!</p></div>'
            });
          } else {
            pMusic.play();
            pMusicPlaying = 1;
            launchCommandAsVisitor({
              cmd: vInput,
              res: '<div><p>[ <span class="green">SUCCESS</span> ] Music playing!</p></div>'
            });
          }
        } else if( vInput === "music stop" ) {
          if( pMusicPlaying == 0 ) {
            launchCommandAsVisitor({
              cmd: vInput,
              res: '<div><p>[ <span class="red">ERROR</span> ] Music is already stopped!</p></div>'
            });
          } else {
            pMusic.pause();
            pMusic.currentTime = 0;
            pMusicPlaying = 0;
            launchCommandAsVisitor({
              cmd: vInput,
              res: '<div><p>[ <span class="green">SUCCESS</span> ] Music stopped!</p></div>'
            });
          }
        } else if( vInput === "music link" ) {
          var win = window.open("https://www.youtube.com/watch?v=xpPWNOhJtqs", "_blank");
          win.focus();
          launchCommandAsVisitor({
            cmd: vInput,
            res: ''
          });
        } else {
          launchCommandAsVisitor({
            cmd: vInput,
            res: '<div><p>[ <span class="red">day</span> ] Usage: music [play/stop/link]</p></div>'
          });
        }
      } else if( vInput === "map" ) {
        window.location.href = "three/index.html"
      } else if( vInput === "wad" ) {
        window.location.href = "wad-editor/index.html"
      } else if( vInput === "sdev" ) {
        enableKeys = true;
        launchCommandAsVisitor({
            cmd: '****',
            res: '<div><p>[ <span class="green">SUCCESS</span> ] Developer Mode: Activated!</p></div>'
          });
      } else if( vInput.trim() !== "" )
        launchCommandAsVisitor( commands[vInput] );
    }
  } catch( error ) {
    if( root > 0 ) {
      launchCommandAsRoot({
        cmd: $('input').val(),
        res: '<div><p>day: ' + $('input').val() + ': command not found</p></div>'
      });
    } else {
      launchCommandAsVisitor({
        cmd: $('input').val(),
        res: '<div><p>day: ' + $('input').val() + ': command not found</p></div>'
      });
    }
    if( $('input').val() === 'clear' )
      $('#content > *').not(':last').remove();
  }
  $('input').val('');$('#content').getNiceScroll(0).resize().doScrollTop($('#content')[0].scrollHeight, 0);
})

function get_visits() {
  if( localStorage.getItem('hitcount') === null )
    localStorage.setItem( 'hitcount', Math.max( visits, Math.random() * 1000000 ) );

  let hitcount = parseInt( localStorage.getItem('hitcount') ) || 0;
  hitcount++;
  localStorage.setItem( 'hitcount', hitcount );
  return hitcount;
}
