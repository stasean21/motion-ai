// real photos (provided by the user, 4:5). kind → file
const PH={boring:'00a',boring2:'00b',messy:'01a',product:'01b',soft0:'02a',soft:'02b',hard0:'03a',hard:'03b',rim0:'04a',rim:'04b',golden0:'05a',golden:'05b',
  macro0:'06a',macro:'06b',low0:'07a',low:'07b',clutter:'08a',minimal:'08b',editorial0:'09a',editorial:'09b',blur0:'10a',blur:'10b'};
const img=(k,style='')=>`<img src="assets/ph/${PH[k]}.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${style}">`;
function photo(kind,x,y,w,h){return `<div class="photo" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${img(kind)}</div>`}
