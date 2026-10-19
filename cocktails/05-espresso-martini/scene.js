// Espresso Martini — 34 с, 120 BPM, EN. Объёмные слова в 3D-пространстве собирают коктейль.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W=1080,H=1920,DURATION=34;
const CREAM=0xF1E4CF,AMBER=0xF0A848,GOLD='#D2AA62',INK='#F1E4CF';
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,p)=>a+(b-a)*p,seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,eoe=p=>p>=1?1:1-Math.pow(2,-10*p),eie=p=>p<=0?0:Math.pow(2,10*p-10),eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.7){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// падение с отскоком: 1 → 0 (высота), с затухающими подскоками
function bounce(dt,T=.32){if(dt<=0)return 1;if(dt<T)return 1-(dt/T)**2;const u=dt-T;return Math.exp(-u*6)*Math.abs(Math.sin(u*13))*.14;}
// ---------- рендер ----------
const gl=document.getElementById('gl'),out=document.getElementById('c'),O=out.getContext('2d');
const renderer=new THREE.WebGLRenderer({canvas:gl,antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.localClippingEnabled=true;
const scene=new THREE.Scene();const BGC=new THREE.Color(0x160709);scene.background=BGC;scene.fog=new THREE.Fog(0x160709,7,24);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.5;
const cam=new THREE.PerspectiveCamera(34,W/H,.05,80);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:2,aperture:.004,maxblur:.008});composer.addPass(bokeh);composer.addPass(new OutputPass());
// свет: мягкий ключ слева сверху, тёплый контровой сзади, заполняющий снизу
scene.add(new THREE.HemisphereLight(0xffe6d0,0x2a0a0e,.55));
const key=new THREE.DirectionalLight(0xfff0e0,2.0);key.position.set(-4,7,6);scene.add(key);
const rim=new THREE.DirectionalLight(0xffb070,2.4);rim.position.set(3,4,-7);scene.add(rim);

// ---------- среда: бархат, стойка ----------
const velvet=new THREE.Mesh(new THREE.CylinderGeometry(19,19,34,160,1,true),new THREE.ShaderMaterial({side:THREE.BackSide,
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){float a=atan(vP.z,vP.x);float f=.5+.5*sin(a*46.+sin(a*9.)*1.6);float s=pow(f,3.);
    float v=smoothstep(-6.,4.,vP.y)*(1.-smoothstep(6.,14.,vP.y));vec3 c=mix(vec3(.10,.025,.04),vec3(.30,.07,.10),s*.8)*(.35+.75*v);gl_FragColor=vec4(c,1.);}`}));
velvet.position.y=6;scene.add(velvet);
const floor=new THREE.Mesh(new THREE.CircleGeometry(30,96),new THREE.MeshStandardMaterial({color:0x1a0709,roughness:.9,metalness:0,envMapIntensity:.15}));floor.rotation.x=-Math.PI/2;scene.add(floor);
// контактные тени
const blobTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=g.createRadialGradient(64,64,4,64,64,64);r.addColorStop(0,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
function blob(x,z,s){const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.003,z);scene.add(m);return m;}
// ---------- шрифты и объёмный текст ----------
const FONTS={};
async function loadFonts(){const ld=new TTFLoader();for(const[k,f]of[['H','Limelight-Regular'],['T','PoiretOne-Regular'],['S','GreatVibes-Regular']]){FONTS[k]=new Font(await new Promise((r,j)=>ld.load(`fonts/${f}.ttf`,r,undefined,j)));}}
const DEPTH={H:.32,T:.07,S:.12};
function textGeo(s,f,al='c'){const g=new TextGeometry(s,{font:FONTS[f],size:1,depth:DEPTH[f],curveSegments:f==='S'?8:5,bevelEnabled:f!=='T',bevelThickness:.025,bevelSize:f==='S'?.012:.02,bevelSegments:3});
  g.computeBoundingBox();const b=g.boundingBox;g.translate(al==='l'?-b.min.x:al==='r'?-b.max.x:-(b.min.x+b.max.x)/2,0,-DEPTH[f]/2);g.computeBoundingBox();return g;}
const matFor=(col,f)=>new THREE.MeshStandardMaterial({color:col,roughness:col===AMBER?.26:.42,metalness:col===AMBER?.35:.05,transparent:true,envMapIntensity:col===AMBER?1.2:.7});
// ---------- камера: ключи, сплайн Эрмита ----------
const RV=[Math.cos(1.0),0,-Math.sin(1.0)];const RP=[1.15-RV[0]*1.25,0,-1.85-RV[2]*1.25];const RT=[RP[0]+RV[0]*.35,1.25,RP[2]+RV[2]*.35];// площадка пропорции
const orbit=(phi,R,y,t=[0,1.3,0])=>[Math.sin(phi)*R+t[0],y,Math.cos(phi)*R+t[2],...t];
const G=[1.15,0,-1.85];// мартини-бокал
const CK=[
 // t      px    py    pz     tx   ty   tz    fov
 [0   ,   0.0,  .75,  8.6,   0, 1.7,  0, 34],
 [3.4 ,   0.4,  .95,  7.4,   0, 1.8,  0, 34],
 [5.6 ,   0.7,  2.3,  7.2,   0, 2.0,  0, 34],
 [7.6 ,   0.2,  1.9,  7.0,   0, 1.9,  0, 34],
 [10.2,  -0.6,  1.7,  6.8,   0, 1.6,  0, 34],
 [11.6, ...orbit(-.45,6.2,1.8),34],
 [13.6, ...orbit(.12,6.2,1.9),34],
 [15.6, ...orbit(.62,6.2,2.0),34],
 [17.4, ...orbit(.95,6.2,2.2,[0,1.75,0]),34],
 [18.8, ...orbit(1.05,6.0,2.2,[0,1.75,0]),34],
 [20.3,   7.3,  2.8,  3.1, 0.7, 1.6,-0.9, 34],
 [21.3,   6.5,  2.7,  2.2, 0.95,1.5,-1.4, 34],
 [22.3, ...orbit(1.05,3.0,2.45,[G[0],1.55,G[2]]),30],
 [23.6, ...orbit(.98,2.9,2.4,[G[0],1.55,G[2]]),30],
 [25.0, ...orbit(1.0,8.9,2.3,RT),34],
 [27.8, ...orbit(.95,8.8,2.2,RT),34],
 [29.0, ...orbit(1.1,6.3,2.5,[G[0],1.25,G[2]]),32],
 [32.0, ...orbit(.96,6.1,2.4,[G[0],1.25,G[2]]),32],
 [34  , ...orbit(.92,6.2,2.5,[G[0],1.35,G[2]]),34]];
function camAt(t){const K=CK,n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;const t0=K[i][0],h=K[i+1][0]-t0,u=cl((t-t0)/h);
  const tan=(j,c)=>j<=0||j>=n-1?0:(K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0]);
  const Hm=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{p:new THREE.Vector3(Hm(1),Hm(2),Hm(3)),t:new THREE.Vector3(Hm(4),Hm(5),Hm(6)),fov:Hm(7)};}
// мировая точка по экранным координатам кадра в момент tf: sx,sy ∈ [-1,1], d — расстояние от камеры
function place(tf,sx,sy,d){const C=camAt(tf);const f=C.t.clone().sub(C.p).normalize(),r=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0)).normalize(),u=new THREE.Vector3().crossVectors(r,f);
  const hh=d*Math.tan(C.fov*Math.PI/360),hw=hh*W/H;const P=C.p.clone().add(f.multiplyScalar(d)).add(r.multiplyScalar(sx*hw)).add(u.multiplyScalar(sy*hh));
  return{P,yaw:Math.atan2(C.p.x-P.x,C.p.z-P.z),hw,hh};}
// ---------- слова ----------
// o: {s,f,col,at:[tf,sx,sy,d],w(доля ширины кадра)|h, in,a,dur,out,outA,clip}
const WORDS=[];
function word(o){const g=textGeo(o.s,o.f,o.al),b=g.boundingBox,gw=b.max.x-b.min.x,gh=b.max.y;const pl=place(...o.at);
  const sc=o.h?o.h*2*pl.hh/gh:(o.w*2*pl.hw)/gw;const mat=matFor(o.col||CREAM,o.f);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);if(o.clip!==false)mat.clippingPlanes=[plane];
  const mesh=new THREE.Mesh(g,mat);const pivot=new THREE.Group();const grp=new THREE.Group();pivot.add(mesh);grp.add(pivot);scene.add(grp);
  grp.position.copy(pl.P);grp.rotation.y=pl.yaw;grp.scale.setScalar(sc);
  const w={...o,g,grp,pivot,mesh,mat,plane,P:pl.P.clone(),yaw:pl.yaw,sc,gh,gw};WORDS.push(w);return w;}
function updWord(w,t){const tIn=w.in,tOut=w.out??99,od=w.outDur||.45;const vis=t>=tIn-.001&&t<tOut+od;w.grp.visible=vis;if(!vis)return;
  const p=seg(t,tIn,w.dur||.55);let dy=0,dz=0,sc=1,ry=0,rx=0,op=1,clipY=w.P.y-w.sc*.02;
  w.pivot.position.set(0,0,0);w.mesh.position.set(0,0,0);
  switch(w.a){
    case'rise':dy=-(1-eoe(p))*w.gh*w.sc*1.15;break;
    case'drop':{const b=bounce(t-tIn,.34);dy=b*w.gh*w.sc*4;const sq=t-tIn>.34?Math.exp(-(t-tIn-.34)*9)*.18:0;sc=1;w.mesh.scale.set(1+sq*.5,1-sq,1);clipY=-99;break;}
    case'slam':{const s=spring(t-tIn,1.9,.55);sc=lerp(2.2,1,cl(s,0,1.25));dz=(1-cl(s,0,1))*1.4;op=seg(t,tIn,.12);clipY=-99;break;}
    case'swing':{const e=eoe(p);ry=(1-e)*-1.35;op=eoc(seg(t,tIn,.35));clipY=-99;break;}
    case'flip':{const e=eoe(p);w.mesh.position.y=-w.gh;w.pivot.position.y=w.gh;rx=(1-e)*-Math.PI/2;op=seg(t,tIn,.15);clipY=-99;break;}
    case'fade':op=eoc(p);clipY=-99;break;}
  if(w.a!=='drop')w.mesh.scale.set(1,1,1);
  if(t>=tOut){const q=seg(t,tOut,od);switch(w.outA||'up'){
    case'up':dy+=eie(q)*w.gh*w.sc*1.2;clipY=-99;op*=1-eie(q);break;
    case'sink':rx+=-eio(q)*Math.PI/2;w.mesh.position.y=0;dy-=eie(q)*w.gh*w.sc*1.3;clipY=w.P.y-w.sc*.02;break;
    case'away':ry+=eie(q)*1.4;op*=1-q;clipY=-99;break;
    case'fade':op*=1-q;clipY=-99;break;
    case'down':dy-=eie(q)*w.gh*w.sc*1.2;break;}}
  w.grp.position.set(w.P.x,w.P.y+dy,w.P.z);w.grp.translateZ(dz);w.grp.rotation.set(0,w.yaw+ry,0);w.pivot.rotation.x=rx;w.grp.scale.setScalar(w.sc*sc);
  w.mat.opacity=op;w.plane.constant=-clipY;}
// по буквам: для SHAKE, STRAIN
const LETTERS=[];
function lettersWord(o){const font=FONTS[o.f],res=font.data.resolution;const chars=[...o.s];let x=0;const adv=chars.map(ch=>{const gl_=font.data.glyphs[ch]||font.data.glyphs['?'];const a=x;x+=gl_.ha/res;return a;});const total=x;
  const pl=place(...o.at);const sc=o.h?o.h:(o.w*2*pl.hw)/total;const grp=new THREE.Group();grp.position.copy(pl.P);grp.rotation.y=pl.yaw;grp.scale.setScalar(sc);scene.add(grp);
  const items=chars.map((ch,i)=>{if(ch===' ')return null;const g=new TextGeometry(ch,{font,size:1,depth:DEPTH[o.f],curveSegments:5,bevelEnabled:o.f!=='T',bevelThickness:.025,bevelSize:.02,bevelSegments:3});g.computeBoundingBox();const b=g.boundingBox;const cx=(b.min.x+b.max.x)/2;g.translate(-cx,0,-DEPTH[o.f]/2);
    const mat=matFor(o.cols?.[i]??o.col??CREAM,o.f);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);mat.clippingPlanes=[plane];const m=new THREE.Mesh(g,mat);m.userData={x0:adv[i]+cx-total/2,plane,mat};grp.add(m);return m;}).filter(Boolean);
  const L={...o,grp,items,sc,P:pl.P.clone()};LETTERS.push(L);return L;}
// ---------- шейкер (бостон: стекло + металлический стакан) ----------
const fresnel=(k=1,side=THREE.DoubleSide)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,side,uniforms:{k:{value:k}},
  vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float k;varying vec3 vN;varying vec3 vV;void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float f=pow(1.-abs(dot(n,vV)),2.4);
    float s1=exp(-pow((n.x+.6)/.07,2.))*.7,s2=exp(-pow((n.x-.75)/.06,2.))*.55;float f3=pow(1.-abs(dot(n,vV)),3.2);float a=clamp((.006+f3*.42+s1*.6+s2*.5)*k,0.,.7);vec3 c=mix(vec3(1.),vec3(1.,.86,.7),s2)*(.8+f*.35);gl_FragColor=vec4(c,a*(gl_FrontFacing?1.:.35));}`});
const shaker=new THREE.Group();scene.add(shaker);const shBlob=blob(0,0,2.2);
const GH=1.62,rIn=y=>lerp(.40,.53,y/GH);
const glassProfile=[[0,0],[.42,0],[.43,.03],[.55,GH],[.53,GH],[.41,.08],[0,.08]].map(([a,b])=>new THREE.Vector2(a,b));
const bostonGlass=new THREE.Mesh(new THREE.LatheGeometry(glassProfile,72),fresnel());bostonGlass.renderOrder=5;shaker.add(bostonGlass);
const LAY=[{ml:50,col:0xE6EEEE,op:.14},{ml:30,col:0x3a1a0c,op:.95},{ml:20,col:0x6a3412,op:.92}];const UML=.0105;
const layMeshes=LAY.map(L=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,48),new THREE.MeshStandardMaterial({color:L.col,emissive:new THREE.Color(L.col).multiplyScalar(L.ml===50?0:.25),roughness:.15,envMapIntensity:1.3,transparent:true,opacity:L.op,depthWrite:false}));m.renderOrder=2;shaker.add(m);return m;});
const LIQPLANE=new THREE.Plane(new THREE.Vector3(0,-1,0),0);const mixed=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,48),new THREE.MeshStandardMaterial({color:0x5a2c14,emissive:0x2a1006,roughness:.14,envMapIntensity:1.3,transparent:true,opacity:.95,depthWrite:false,clippingPlanes:[LIQPLANE]}));mixed.renderOrder=2;shaker.add(mixed);
const foamTop=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,48),new THREE.MeshStandardMaterial({color:0xC9976A,roughness:.7,transparent:true,opacity:.95,depthWrite:false}));foamTop.renderOrder=3;shaker.add(foamTop);
const iceMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.05,metalness:0,transparent:true,opacity:.42,envMapIntensity:2.2,depthWrite:false});
const ICE=[0,1,2,3].map(i=>{const m=new THREE.Mesh(new RoundedBoxGeometry(.28,.28,.28,3,.05),iceMat);m.renderOrder=4;shaker.add(m);return m;});
const tin=new THREE.Group();shaker.add(tin);
{const p=[[0,0],[.61,0],[.62,.04],[.5,1.0],[.48,1.06],[0,1.08]].map(([a,b])=>new THREE.Vector2(a,b));
 tin.add(new THREE.Mesh(new THREE.LatheGeometry(p,72),new THREE.MeshStandardMaterial({color:0xe8e4dc,metalness:1,roughness:.2})));
 [.14,.2,.86].forEach(y=>{const r=lerp(.62,.5,y);const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.006,.012,8,72),new THREE.MeshStandardMaterial({color:0xD2AA62,metalness:1,roughness:.25}));ring.rotation.x=Math.PI/2;ring.position.y=y;tin.add(ring);});}
// ---------- мартини-бокал ----------
const martini=new THREE.Group();martini.position.set(...G);scene.add(martini);const mBlob=blob(G[0],G[2],1.6);
const MB=1.02,MR=1.66,MRAD=.74;
const mProfile=[[0,0],[.44,0],[.44,.025],[.06,.06],[.035,.12],[.03,MB-.06],[.06,MB],[MRAD,MR],[MRAD-.02,MR],[.03,MB+.03],[0,MB+.03]].map(([a,b])=>new THREE.Vector2(a,b));
const mGlass=new THREE.Mesh(new THREE.LatheGeometry(mProfile,96),fresnel(.42,THREE.FrontSide));mGlass.renderOrder=6;martini.add(mGlass);
const coneGeo=new THREE.ConeGeometry(1,1,64,1,false);coneGeo.rotateX(Math.PI);coneGeo.translate(0,.5,0);// вершина внизу, y 0..1
const mLiquid=new THREE.Mesh(coneGeo,new THREE.MeshStandardMaterial({color:0x3a1a0b,emissive:0x1a0904,roughness:.12,envMapIntensity:1.3,transparent:true,opacity:.97,depthWrite:false}));mLiquid.renderOrder=3;martini.add(mLiquid);
const cremaTex=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');const r=g.createRadialGradient(256,256,30,256,256,256);r.addColorStop(0,'#D9A877');r.addColorStop(.75,'#C08350');r.addColorStop(1,'#8E5530');g.fillStyle=r;g.fillRect(0,0,512,512);
  for(let i=0;i<2600;i++){const a=hash(i)*6.283,rr=Math.sqrt(hash(i+1))*250;g.fillStyle=`rgba(${hash(i+2)>.5?'255,236,205':'120,70,35'},${.15+hash(i+3)*.3})`;g.beginPath();g.arc(256+Math.cos(a)*rr,256+Math.sin(a)*rr,1+hash(i+4)*3.5,0,7);g.fill();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const crema=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,64),[new THREE.MeshStandardMaterial({color:0x7a4a28,roughness:.8}),new THREE.MeshStandardMaterial({map:cremaTex,roughness:.75}),new THREE.MeshStandardMaterial({color:0x7a4a28})]);crema.renderOrder=4;martini.add(crema);
// зерно кофе
function beanMesh(s=1){const g=new THREE.Group();const dome=new THREE.Mesh(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x3b1d0e,roughness:.32,metalness:.05}));dome.scale.set(.13*s,.06*s,.085*s);g.add(dome);
  const base=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshStandardMaterial({color:0x2a1408,roughness:.5}));base.rotation.x=Math.PI/2;base.scale.set(.11*s,.08*s,1);g.add(base);
  const crease=new THREE.Mesh(new THREE.TorusGeometry(.075*s,.008*s,6,24,Math.PI*.9),new THREE.MeshStandardMaterial({color:0x140804,roughness:.6}));crease.rotation.set(Math.PI/2,0,Math.PI*.55);crease.position.y=.062*s;crease.scale.set(1,.35,1);g.add(crease);return g;}
const BEANS=[0,1,2].map(i=>{const b=beanMesh(1);martini.add(b);return b;});
// фон: парящие зёрна — дальний план
const FLOAT=Array.from({length:26},(_,i)=>{const b=beanMesh(1.4+hash(i+3)*1.6);const a=hash(i)*6.283,R=10+hash(i+9)*6;b.userData={a,R,y:1.8+hash(i+5)*6.5,sp:.03+hash(i+7)*.05,rs:hash(i+11)*2};scene.add(b);return b;});
// ---------- пропорция: объёмные столбики ----------
const PIL=[[5,AMBER,'5'],[3,CREAM,'3'],[2,CREAM,'2']].map(([v,col],i)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(.54,1,.54,3,.06),new THREE.MeshStandardMaterial({color:i?0x3a1a12:0x6a3a14,roughness:.35,metalness:.4}));const g=new THREE.Group();g.add(m);m.position.y=.5;scene.add(g);g.position.set(RP[0]+RV[0]*(i-1)*.66,0,RP[2]+RV[2]*(i-1)*.66);g.userData={v,col};return g;});
// ---------- потоки ----------
const streamGeo=new THREE.CylinderGeometry(.032,.032,1,20,1,true);streamGeo.translate(0,-.5,0);
const streamMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.1,transparent:true,opacity:.9,depthWrite:false});
const STREAMS=[0xE6EEEE,0x2a140a,0x5a2c12].map(c=>{const m=new THREE.Mesh(streamGeo,streamMat(c));m.renderOrder=4;scene.add(m);return m;});
const pourStream=new THREE.Mesh(new THREE.CylinderGeometry(.05,.035,1,20,1,true).translate(0,-.5,0),streamMat(0x2e160b));pourStream.renderOrder=4;scene.add(pourStream);
// ---------- тайминг ----------
const D=new THREE.Vector3(G[0],0,G[2]).normalize();const YAW=Math.atan2(-D.z,D.x);
const TILT=new THREE.Euler(0,YAW,-1.95,'YXZ');const LIPOFF=new THREE.Vector3(.54,GH,0).applyEuler(TILT);
const POURPOS=new THREE.Vector3(G[0],MR+.45,G[2]).sub(LIPOFF);
const T={pours:[11.35,13.35,15.35],pd:.9,ice:16.55,cap:16.95,shake:[17.2,18.7],tinOff:18.8,tilt:[19.2,20.0],pour:[19.95,1.2],back:[21.25,.5],beans:[22.0,22.5,23.0]};
// ---------- партитура слов ----------
function score(){const A=(tf,sx,sy,d)=>[tf,sx,sy,d];
  // 1 · хук
  word({s:'COFFEE?',f:'H',at:A(3,-.04,.58,5.2),w:.6,in:.5,a:'rise',out:3.55,outA:'sink',outDur:.6});
  word({s:'COCKTAIL?',f:'H',at:A(3,.05,.36,6.4),w:.68,in:1.0,a:'rise',out:3.65,outA:'sink',outDur:.6});
  word({s:'BOTH.',f:'H',col:AMBER,at:A(3,0,.02,4.6),w:.62,in:1.5,a:'drop',out:3.75,outA:'sink',outDur:.6});
  // 2 · название
  word({s:'Espresso',f:'S',at:A(5.6,0,.46,5.0),w:.76,in:4.0,a:'swing',dur:.8,out:7.1,outA:'away'});
  word({s:'Martini',f:'S',col:AMBER,at:A(5.6,.04,.22,5.0),w:.58,in:4.3,a:'swing',dur:.8,out:7.2,outA:'away'});
  word({s:'THE MIDNIGHT CLASSIC',f:'T',at:A(5.6,0,.06,5.0),w:.6,in:4.8,a:'rise',out:7.2,outA:'fade'});
  // 3 · список: плашки откидываются
  [['50','VODKA',CREAM],['30','ESPRESSO',AMBER],['20','COFFEE LIQUEUR',CREAM],['+','ICE · 3 COFFEE BEANS',CREAM]].forEach(([n,name,col],i)=>{
    const tin=7.75+i*.5,sy=.6-i*.16,o={in:tin,a:'flip',dur:.5,out:10.1+i*.05,outA:'up'};
    word({s:n,f:'H',al:'r',col:i===1?AMBER:CREAM,at:A(8.8,-.36,sy,5.0),h:i===3?.035:.058,...o});
    if(i<3)word({s:'ml',f:'T',al:'l',at:A(8.8,-.34,sy,5.0),h:.022,...o,in:tin+.03});
    word({s:name,f:'T',al:'l',col,at:A(8.8,-.2,sy+.005,5.0),h:i===3?.024:.034,...o,in:tin+.06,max:.66});});
  // 4–6 · ингредиенты вокруг шейкера
  const ing=(t0,tf,num,big,small,keyBig)=>{
    word({s:num,f:'H',al:'r',at:A(tf,.12,.5,4.6),h:.11,in:t0,a:'slam',out:t0+1.75,outA:'up'});
    word({s:'ml',f:'T',al:'l',at:A(tf,.16,.5,4.6),h:.04,in:t0+.12,a:'rise',out:t0+1.77,outA:'up'});
    word({s:big,f:'H',col:keyBig?AMBER:CREAM,at:A(tf,0,.3,4.9),w:.78,in:t0+.25,a:'rise',out:t0+1.8,outA:'up'});
    if(small)word({s:small,f:'T',at:A(tf,0,.19,4.9),w:.42,in:t0+.4,a:'rise',out:t0+1.82,outA:'up'});};
  ing(10.55,11.6,'50','VODKA',null,true);
  ing(12.55,13.6,'30','ESPRESSO','FRESH · COOLED',true);
  ing(14.55,15.6,'20','COFFEE','LIQUEUR',true);
  // 7 · шейк
  word({s:'+ ICE',f:'T',at:A(16.8,0,.52,4.8),w:.28,in:16.5,a:'rise',out:17.0,outA:'up',outDur:.3});
  lettersWord({s:'SHAKE',f:'H',col:AMBER,at:A(18,0,.66,4.4),w:.74,in:17.0,role:'shake'});
  word({s:'HARD · 15 SECONDS',f:'T',at:A(18,0,.54,4.4),w:.56,in:17.3,a:'rise',out:18.75,outA:'up'});
  // 8 · процеживание
  word({s:'DOUBLE',f:'T',al:'l',at:A(20.4,-.78,-.22,5.0),w:.36,in:19.4,a:'rise',out:21.3,outA:'up'});
  lettersWord({s:'STRAIN',f:'H',col:AMBER,at:A(20.4,-.32,-.42,5.0),w:.62,in:19.6,role:'strain'});
  // 9 · зёрна — в плоскости резкости бокала
  word({s:'THREE',f:'H',col:AMBER,at:A(23,0,.62,3.0),w:.56,in:21.7,a:'slam',out:23.95,outA:'up'});
  word({s:'BEANS',f:'H',at:A(23,0,.47,3.0),w:.56,in:21.95,a:'rise',out:23.97,outA:'up'});
  word({s:'health · wealth · happiness',f:'S',at:A(23,0,.36,3.0),w:.66,in:23.1,a:'fade',out:23.99,outA:'up'});
  // 10 · пропорция
  word({s:'REMEMBER THE RATIO',f:'T',at:A(26,0,.62,6.3),w:.62,in:24.95,a:'rise',out:27.7,outA:'up'});
  ['vodka','espresso','liqueur'].forEach((n,i)=>word({s:n,f:'T',at:[26,0,0,5],w:.1,in:26.1+i*.2,a:'fade',out:27.7,outA:'fade',pillar:i}));
  // 11 · герой
  word({s:'Espresso Martini',f:'S',at:A(30.0,0,.52,4.4),w:.62,in:28.1,a:'swing',dur:.9,out:31.7,outA:'away'});
  word({s:'VODKA · ESPRESSO · LIQUEUR · SHAKE',f:'T',at:A(30.0,0,.38,4.4),w:.6,in:28.6,a:'rise',out:31.75,outA:'up'});
  // 12 · финал
  word({s:'Save this recipe',f:'S',col:AMBER,at:A(33,0,.5,5.2),w:.72,in:31.9,a:'swing',dur:.8});
  word({s:'AND MAKE IT THIS WEEKEND',f:'T',at:A(33,0,.37,5.2),w:.56,in:32.2,a:'rise'});
}
// числа на столбиках пропорции
let PILNUM=[];
function pillarWords(){PILNUM=PIL.map((g,i)=>{const w=word({s:['5','3','2'][i],f:'H',col:i?CREAM:AMBER,at:[26,0,0,5],h:.62,in:25.1+i*.35,a:'fade',out:27.7,outA:'fade'});w.pil=g;return w;});
  WORDS.filter(w=>w.pillar!==undefined).forEach(w=>{w.pil=PIL[w.pillar];w.sc=.1;w.label=true;w.mesh.renderOrder=8;});}
// ---------- кадр ----------
const tmpV=new THREE.Vector3();
function frame(t){
  const C=camAt(t);let shakeCam=0;const sk=seg(t,T.shake[0],.1)*(1-seg(t,T.shake[1]-.1,.15));
  cam.position.copy(C.p);if(sk>0){cam.position.x+=Math.sin(t*61)*.035*sk;cam.position.y+=Math.cos(t*53)*.03*sk;}
  cam.fov=C.fov;cam.updateProjectionMatrix();cam.lookAt(C.t);
  // фоновые зёрна
  FLOAT.forEach((b,i)=>{const u=b.userData;const a=u.a+t*u.sp;b.position.set(Math.sin(a)*u.R,u.y+Math.sin(t*.4+i)*.25,Math.cos(a)*u.R);b.rotation.set(t*.3+u.rs,t*.2+i,u.rs);});
  // шейкер: положение, тряска, наклон
  let sx=0,sy=0,sz=0,ra=0,rz=0;const shk=seg(t,T.shake[0],.12)*(1-seg(t,T.shake[1]-.1,.15))*.7;
  if(shk>0){const w=t*Math.PI*2*6.5;sx=Math.sin(w)*.06*shk;sy=Math.abs(Math.cos(w))*.18*shk+.15*shk;rz=Math.sin(w+1)*.08*shk;}
  const tl=eio(seg(t,T.tilt[0],T.tilt[1]-T.tilt[0])),bk=eio(seg(t,T.back[0],T.back[1]));
  shaker.rotation.order='YXZ';shaker.position.set(sx+POURPOS.x*tl-D.x*bk*3,sy+POURPOS.y*tl+bk*2,sz+POURPOS.z*tl-D.z*bk*3);shaker.rotation.set(0,YAW*tl,rz-1.95*tl+bk*.7);
  shaker.visible=bk<.999;shBlob.material.opacity=1-tl;
  // слои в стакане
  const shook=seg(t,T.shake[0],.4);let base=.08;
  LAY.forEach((L,i)=>{const f=eoc(seg(t,T.pours[i]+.15,T.pd));const h=L.ml*UML*f;const m=layMeshes[i];m.visible=h>.002&&shook<1;
    if(m.visible){const r=rIn(base+h/2)-.02;m.scale.set(r,h,r);m.position.y=base+h/2;m.material.opacity=L.op*(1-shook);}base+=h;});
  const total=100*UML,remain=1-seg(t,T.pour[0]+.05,T.pour[1]-.1);
  mixed.visible=shook>0&&remain>.01;if(mixed.visible){const h=GH-.1;const r=rIn(.08+h/2)-.03;mixed.scale.set(r,h,r);mixed.position.y=.08+h/2;mixed.material.opacity=.95*shook;
    shaker.updateMatrixWorld();const up=new THREE.Vector3(0,.08+total*.92,0).applyMatrix4(shaker.matrixWorld).y,lipY=new THREE.Vector3(.54,GH,0).applyMatrix4(shaker.matrixWorld).y;
    LIQPLANE.constant=lerp(up,lipY+.12*remain,tl);}
  foamTop.visible=mixed.visible&&tl<.02;if(foamTop.visible){const h=total*.12*shook;const r=rIn(.08+total*.92)-.02;foamTop.scale.set(r,h,r);foamTop.position.y=.08+total*.92+h/2;}
  ICE.forEach((m,i)=>{const t0=T.ice+i*.1;m.visible=t>=t0&&tl<.5;if(!m.visible)return;const dt=t-t0;const y=lerp(3.2,.25+i*.27,1-bounce(dt,.26)*(dt<.26?1:0)-(dt<.26?0:0));
    const yy=dt<.26?lerp(3.2,.25+i*.27,(dt/.26)**2):.25+i*.27+bounce(dt,.26)*.4;m.position.set((i%2?.12:-.12),yy,(i>1?.08:-.08));m.rotation.set(i+dt*(dt<.26?6:0),i*.7,i*.3);});
  const on=eoc(seg(t,T.cap,.25)),off=eie(seg(t,T.tinOff,.4));tin.visible=on>0&&off<1;tin.position.set(off*1.6,GH-.28+(1-on)*3.5+off*3,0);tin.rotation.z=-off*.6;
  // потоки ингредиентов в шейкер
  STREAMS.forEach((m,i)=>{const a=T.pours[i],d=T.pd;m.visible=t>a-.02&&t<a+d+.3;if(!m.visible)return;const top=3.1,lvl=.1+LAY.slice(0,i+1).reduce((s,L,j)=>s+L.ml*UML*eoc(seg(t,T.pours[j]+.15,T.pd)),0);
    const head=t<a+.2?lerp(top,lvl,eie(seg(t,a,.2))):lvl,tail=t>a+d?lerp(top,lvl,eie(seg(t,a+d,.3))):top;m.position.set(.05,tail,0);m.scale.set(1,Math.max(.001,tail-head),1);});
  {const ar=eoc(seg(t,18.55,.8)),r=[.5,0,-.87];const k=(1-ar)*4.5;martini.position.set(G[0]+r[0]*k,0,G[2]+r[2]*k);martini.visible=ar>0;mBlob.position.set(martini.position.x,.003,martini.position.z);mBlob.visible=martini.visible;}
  // мартини: наполнение и крема
  const mf=eio(seg(t,T.pour[0]+.15,T.pour[1]));const s=.06+.94*Math.pow(mf,.8);const lh=(MR-MB-.08)*s;mLiquid.visible=mf>0;if(mLiquid.visible){mLiquid.scale.set((MRAD-.04)*s,lh,(MRAD-.04)*s);mLiquid.position.y=MB+.03;}
  const cr=seg(t,T.pour[0]+.6,1.1);crema.visible=mf>.3;if(crema.visible){const r=(MRAD-.04)*s;const ch=.008+.022*eoc(cr);crema.scale.set(r,ch,r);crema.position.y=MB+.03+lh-ch/2+.004;}
  // пролив
  pourStream.visible=t>T.pour[0]-.02&&t<T.pour[0]+T.pour[1]+.3;if(pourStream.visible){shaker.updateMatrixWorld();const lip=new THREE.Vector3(.54,GH,0).applyMatrix4(shaker.matrixWorld);
    const tgt=G[1]+MB+.03+lh;const a=T.pour[0],d=T.pour[1];const head=t<a+.2?lerp(lip.y,tgt,eie(seg(t,a,.2))):tgt,tail=t>a+d?lerp(lip.y,tgt,eie(seg(t,a+d,.3))):lip.y;
    pourStream.position.set(G[0]+.04,tail,G[2]);pourStream.scale.set(1,Math.max(.001,tail-head),1);}
  // зёрна на пенке
  BEANS.forEach((b,i)=>{const t0=T.beans[i];b.visible=t>=t0-.6;if(!b.visible)return;const dt=t-(t0-.6);const surf=MB+.03+lh+.03;
    const fall=dt<.6?1-(dt/.6)**2:0;const bo=dt>=.6?Math.exp(-(dt-.6)*9)*Math.abs(Math.sin((dt-.6)*16))*.05:0;b.position.set(-.21+i*.21,surf+fall*1.8+bo,.05-Math.abs(i-1)*.05);b.rotation.set(fall*2,.35*(i-1)+1.57,fall*1.5);b.scale.setScalar(.85);});
  // столбики пропорции
  PIL.forEach((g,i)=>{const p=spring(t-(25.05+i*.35),1.6,.6);const out=eie(seg(t,27.7,.4));const h=g.userData.v*.36*cl(p,0,1.15)*(1-out);g.visible=h>.01;g.children[0].scale.y=Math.max(.01,h);g.children[0].position.y=h/2;});
  // слова
  WORDS.forEach(w=>{if(w.pil){const g=w.pil,h=g.children[0].scale.y;const top=new THREE.Vector3(g.position.x,h+.06,g.position.z);
      w.yaw=Math.atan2(cam.position.x-top.x,cam.position.z-top.z);if(w.label){top.y=.1;top.x+=Math.sin(w.yaw)*.42;top.z+=Math.cos(w.yaw)*.42;}w.P.copy(top);if(!w.label)w.sc=.7;}
    updWord(w,t);});
  LETTERS.forEach(L=>{L.grp.visible=t>=L.in&&t<(L.role==='shake'?19.0:21.75);if(!L.grp.visible)return;
    L.items.forEach((m,i)=>{const u=m.userData;let x=u.x0,y=0,rz_=0,sc=1,op=1;
      if(L.role==='shake'){const p=spring(t-L.in-i*.04,2,.5);sc=lerp(2,1,cl(p,0,1.2));op=seg(t,L.in+i*.04,.1);const w=t*Math.PI*2*8+i*1.7;const a=sk*.07;x+=Math.sin(w)*a;y+=Math.cos(w*1.13)*a*1.3;rz_=Math.sin(w*.9+i)*.18*sk;
        const q=seg(t,18.7+i*.03,.3);y+=eie(q)*1.2;op*=1-eie(q);}
      else{const td=L.in+i*.08,e=eoe(seg(t,td,.5));y=(1-e)*1.1;op=seg(t,td,.1);const q=seg(t,21.25+i*.04,.4);y-=eie(q)*1.2;op*=1-q;u.plane.constant=-(L.P.y-.02*L.sc);}
      m.position.set(x,y,0);m.rotation.z=rz_;m.scale.setScalar(sc);u.mat.opacity=op;if(L.role==='shake')u.plane.constant=99;});});
  // глубина резкости — только на макро зёрен
  const dof=seg(t,21.4,.6)*(1-seg(t,24.0,.6));bokeh.enabled=dof>0.01;if(bokeh.enabled){bokeh.uniforms.focus.value=cam.position.distanceTo(new THREE.Vector3(G[0],1.7,G[2]));bokeh.uniforms.aperture.value=.0035*dof;bokeh.uniforms.maxblur.value=.009*dof;}
  composer.render();
  // оверлей: золотая рамка ар-деко, 18+, предупреждение
  O.drawImage(gl,0,0);decoFrame(O);O.save();O.beginPath();O.roundRect(76,84,110,56,4);O.strokeStyle=INK;O.lineWidth=2;O.stroke();O.font='32px Deco';O.textAlign='center';O.fillStyle=INK;O.fillText('18+',131,123);O.restore();
  const wp=eoe(seg(t,32.4,.4));if(wp>0){O.save();O.globalAlpha=wp;O.font='26px Deco';O.letterSpacing='2px';O.textAlign='center';O.fillStyle=INK;O.fillText('PLEASE DRINK RESPONSIBLY',541,1860);O.restore();}}
function decoFrame(c){c.strokeStyle=GOLD;c.globalAlpha=.85;c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);c.lineWidth=1;c.strokeRect(54,54,W-108,H-108);
  c.save();c.translate(540,54);for(let r=30;r<=110;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI);c.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*30,Math.sin(a)*30);c.lineTo(Math.cos(a)*110,Math.sin(a)*110);c.stroke();}c.restore();
  [[54,54,1,1],[W-54,54,-1,1],[54,H-54,1,-1],[W-54,H-54,-1,-1]].forEach(([x,y,sx,sy])=>{c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,70);c.lineTo(70,0);c.moveTo(0,40);c.lineTo(40,0);c.stroke();c.restore();});c.globalAlpha=1;}
window.seek=async t=>frame(t);
window.ready=(async()=>{await loadFonts();await document.fonts.load('32px Deco');score();pillarWords();frame(0);})();
