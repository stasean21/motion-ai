import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const W=1080,H=1920;
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();const pm=new THREE.PMREMGenerator(renderer);
scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.55;
const cam=new THREE.PerspectiveCamera(30,W/H,.1,50);cam.position.set(0,1.75,7.4);cam.lookAt(0,1.62,0);
// ---------- бокал: тело вращения по контуру фото ----------
const ROWS=CONT.rows,PX=1135,K=2/PX;const RAW=r=>{const v=ROWS[r]||ROWS[r+1]||ROWS[r-1];return v?(v[1]-v[0])/2*K:0;};
const SM=[];for(let r=0;r<=PX;r++){let s=0,n=0;const w=r>1080?2:r>500?3:16;for(let d=-w;d<=w;d++){const v=RAW(r+d);if(v>0){s+=v;n++;}}SM[r]=n?s/n:0;}const R=r=>SM[Math.max(0,Math.min(PX,r))];const Y=r=>(PX-r)*K;
const TH=6*K,RIM=12,BOWL=488;
function glassProfile(){const p=[new THREE.Vector2(0,0)];
  for(let r=PX-1;r>=RIM;r-=4)p.push(new THREE.Vector2(Math.max(R(r),.012),Y(r)));
  p.push(new THREE.Vector2(R(RIM)-TH*.5,Y(RIM)+.004));
  for(let r=RIM;r<=BOWL;r+=2)p.push(new THREE.Vector2(Math.max(R(r)-TH,.001),Y(r)));
  p.push(new THREE.Vector2(0,Y(BOWL)));return p;}
const glassMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 vN;varying vec3 vV;void main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float f=pow(1.-abs(dot(n,vV)),2.6);
    float s1=exp(-pow((n.x+.62)/.05,2.))*.8, s2=exp(-pow((n.x-.78)/.05,2.))*.75, s3=exp(-pow((n.x+.2)/.03,2.))*.18;float top=smoothstep(.55,.95,n.y)*.5;
    float a=clamp(.025+f*.8+s1+s2+s3+top,0.,1.);vec3 c=mix(vec3(1.),vec3(1.,.9,.82),s2)*(.75+f*.4);gl_FragColor=vec4(c,a*(gl_FrontFacing?1.:.55));}`});
const glass=new THREE.Mesh(new THREE.LatheGeometry(glassProfile(),128),glassMat);glass.renderOrder=5;scene.add(glass);
// ---------- напиток ----------
const liquidMat=new THREE.MeshPhysicalMaterial({color:0xE5470A,roughness:.1,transparent:true,opacity:.96,clearcoat:.8,envMapIntensity:.9,emissive:0x6a1800,depthWrite:false});
let liquid=null;
function setLevel(f,color){if(liquid){scene.remove(liquid);liquid.geometry.dispose();}if(f<=0)return;const top=Math.round(BOWL-(BOWL-RIM-18)*f);
  const p=[new THREE.Vector2(0,Y(BOWL-2))];for(let r=BOWL-2;r>=top;r-=2)p.push(new THREE.Vector2(Math.max(R(r)-TH-.004,.001),Y(r)));p.push(new THREE.Vector2(0,Y(top)));
  liquidMat.color.set(color);liquid=new THREE.Mesh(new THREE.LatheGeometry(p,96),liquidMat);liquid.renderOrder=2;scene.add(liquid);return Y(top);}
// ---------- лёд ----------
const iceMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.08,transparent:true,opacity:.55,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:2.4,emissive:0x2a2a2a,depthWrite:false});
const ICE=[];[[-.05,.16,.02],[.06,.30,-.03],[-.04,.45,.03],[.05,.58,0],[-.03,.72,-.02]].forEach(([x,dy,z],i)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(.2,.2,.2,4,.035),iceMat);
  m.position.set(x,Y(BOWL)+dy,z);m.rotation.set(.4*i,.7*i+.3,.2*i);m.renderOrder=1;ICE.push(m);});
// пузырьки
const bub=new THREE.InstancedMesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55}),70);bub.renderOrder=3;
// ---------- апельсин ----------
function sliceTex(){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#E9791A';g.beginPath();g.arc(256,256,256,0,7);g.fill();
  g.fillStyle='#FBE6BE';g.beginPath();g.arc(256,256,232,0,7);g.fill();for(let k=0;k<10;k++){const a0=k/10*Math.PI*2+.04,a1=(k+1)/10*Math.PI*2-.04;g.beginPath();g.moveTo(256+Math.cos((a0+a1)/2)*14,256+Math.sin((a0+a1)/2)*14);g.arc(256,256,214,a0,a1);g.closePath();
  const gr=g.createRadialGradient(256,256,20,256,256,214);gr.addColorStop(0,'#FFC872');gr.addColorStop(1,'#F28A22');g.fillStyle=gr;g.fill();}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const slice=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.03,64),[new THREE.MeshStandardMaterial({color:0xE47A1C,roughness:.5}),new THREE.MeshPhysicalMaterial({map:sliceTex(),roughness:.35,clearcoat:.6}),new THREE.MeshPhysicalMaterial({map:sliceTex(),roughness:.35})]);
slice.rotation.set(Math.PI/2,0,-.35);slice.position.set(R(RIM+30)-.02,Y(RIM)-.06,.02);
// ---------- бутылки без брендов ----------
function labelTex(word){const c=document.createElement('canvas');c.width=512;c.height=720;const g=c.getContext('2d');g.fillStyle='#F2E4C6';g.fillRect(0,0,512,720);
  g.strokeStyle='#B08A45';g.lineWidth=6;g.strokeRect(14,14,484,692);g.lineWidth=2;g.strokeRect(28,28,456,664);
  g.save();g.translate(256,360);g.rotate(Math.PI/2);g.fillStyle='#4A1A12';g.font='76px Deco';g.textAlign='center';g.textBaseline='middle';g.fillText(word,0,0);
  g.strokeStyle='#B08A45';g.beginPath();g.moveTo(-200,52);g.lineTo(200,52);g.stroke();g.restore();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function bottle(kind){const grp=new THREE.Group();const P=kind==='pro'?[[0,0],[.15,0],[.155,.02],[.155,.62],[.14,.72],[.08,.86],[.045,.95],[.042,1.18],[.05,1.2],[.05,1.23],[0,1.23]]:[[0,0],[.13,0],[.135,.02],[.135,.56],[.12,.64],[.06,.74],[.036,.8],[.034,1.0],[.042,1.02],[.042,1.05],[0,1.05]];
  const col=kind==='pro'?0x16351F:0xC24A12;const m=new THREE.MeshPhysicalMaterial({color:kind==='pro'?0x0d2416:0x7a2208,roughness:.04,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.8,sheen:0});
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(P.map(([x,y])=>new THREE.Vector2(x,y)),64),m));
  if(kind==='pro'){const f=new THREE.Mesh(new THREE.CylinderGeometry(.047,.07,.36,48,1,true),new THREE.MeshStandardMaterial({color:0xD9B86A,metalness:1,roughness:.28}));f.position.y=1.05;grp.add(f);}
  const lab=new THREE.Mesh(new THREE.CylinderGeometry(kind==='pro'?.158:.138,kind==='pro'?.158:.138,.42,64,1,true,-1.1,2.2),new THREE.MeshStandardMaterial({map:labelTex(kind==='pro'?'ИГРИСТОЕ':'АПЕРИТИВ'),roughness:.7}));
  lab.position.y=.32;grp.add(lab);return grp;}
// ---------- фон: бархат, стол ----------
// бархат: 3D-складки + ворс (sheen) + микрорельеф ткани
function pileNormal(){const N=512,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');const h=new Float32Array(N*N);
  let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<N*N;i++)h[i]=rnd();
  for(let pass=0;pass<2;pass++){const o=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(let d=-1;d<=1;d++)v+=h[y*N+((x+d+N)%N)]+h[((y+d+N)%N)*N+x];o[y*N+x]=v/6;}h.set(o);}
  // лёгкое направление ворса по вертикали
  const img=g.createImageData(N,N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;const dx=h[y*N+(x+1)%N]-h[y*N+(x-1+N)%N],dy=h[((y+1)%N)*N+x]-h[((y-1+N)%N)*N+x];
    let nx=-dx*2.2,ny=-dy*.8,nz=1;const l=Math.hypot(nx,ny,nz);img.data[i*4]=(nx/l*.5+.5)*255;img.data[i*4+1]=(ny/l*.5+.5)*255;img.data[i*4+2]=(nz/l*.5+.5)*255;img.data[i*4+3]=255;}
  g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(46,34);return t;}
const curtainGeo=new THREE.PlaneGeometry(14,10,420,60);{const p=curtainGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);const k=1+.35*(1-(y+5)/10);
  const z=k*(.20*Math.sin(x*2.3+.4)+.08*Math.sin(x*5.3+1.3+y*.05)+.035*Math.sin(x*11.7+2.1))+.02*Math.sin(y*1.3+x*.7);p.setZ(i,z);}curtainGeo.computeVertexNormals();}
const velvet=new THREE.MeshPhysicalMaterial({color:0x34060f,roughness:.95,metalness:0,sheen:1,sheenColor:new THREE.Color(0xd0405a),sheenRoughness:.3,normalMap:pileNormal(),normalScale:new THREE.Vector2(.16,.16),envMapIntensity:.12});
const back=new THREE.Mesh(curtainGeo,velvet);back.position.set(0,4.35,-2.8);back.receiveShadow=true;scene.add(back);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,8),new THREE.MeshPhysicalMaterial({color:0x1c050a,roughness:.45,envMapIntensity:0,specularIntensity:.4}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
// ---------- свет ----------
const key=new THREE.SpotLight(0xffe6cc,90,20,.45,.7,1.6);key.position.set(-3,5,4);key.target.position.set(0,1.2,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);scene.add(key,key.target);
const bgL=new THREE.SpotLight(0xffb3bd,16,20,.6,1,1.5);bgL.position.set(0,2.6,1.4);bgL.target.position.set(0,2.2,-2.8);scene.add(bgL,bgL.target);
const graze=new THREE.SpotLight(0xffd2c2,46,16,.45,.8,1.4);graze.position.set(-5.5,4.2,-1.2);graze.target.position.set(1.5,2.4,-2.8);scene.add(graze,graze.target);
const graze2=new THREE.SpotLight(0xff9cab,25,16,.5,.9,1.4);graze2.position.set(5.5,1.5,-1.4);graze2.target.position.set(-1.5,2.6,-2.8);scene.add(graze2,graze2.target);
const rimA=new THREE.DirectionalLight(0xffffff,2.2);rimA.position.set(3,3,-4);scene.add(rimA);
const rimB=new THREE.DirectionalLight(0xffd7a8,1.4);rimB.position.set(-3,2,-4);scene.add(rimB);
// тень-пятно под бокалом
const sh=new THREE.Mesh(new THREE.CircleGeometry(.5,48),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.002;sh.scale.set(1,.6,1);scene.add(sh);
// ---------- поток ----------
const streamMat=new THREE.MeshPhysicalMaterial({color:0xE04A0A,roughness:.05,clearcoat:1,emissive:0x501200});
// ---------- 2D-слой: текст и рамка ар-деко ----------
const ui=document.getElementById('ui').getContext('2d');const GOLD='#D2AA62',INK='#F1E4CF',ORG='#F58A3A',SOFT='#C9AE8E';
function t2(s,x,y,f,col,ls=0){ui.font=f;ui.letterSpacing=ls+'px';ui.fillStyle=col;ui.textAlign='center';ui.fillText(s,x+ls/2,y);ui.letterSpacing='0px';}
function rule(y,w){ui.strokeStyle=GOLD;ui.lineWidth=2;ui.beginPath();ui.moveTo(540-w/2,y);ui.lineTo(526,y);ui.moveTo(554,y);ui.lineTo(540+w/2,y);ui.stroke();ui.save();ui.translate(540,y);ui.rotate(Math.PI/4);ui.fillStyle=GOLD;ui.fillRect(-6,-6,12,12);ui.restore();}
function frame2d(){ui.clearRect(0,0,W,H);ui.strokeStyle=GOLD;ui.globalAlpha=.85;ui.lineWidth=2;ui.strokeRect(40,40,W-80,H-80);ui.lineWidth=1;ui.strokeRect(54,54,W-108,H-108);
  ui.save();ui.translate(540,54);for(let r=30;r<=110;r+=20){ui.beginPath();ui.arc(0,0,r,0,Math.PI);ui.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;ui.beginPath();ui.moveTo(Math.cos(a)*30,Math.sin(a)*30);ui.lineTo(Math.cos(a)*110,Math.sin(a)*110);ui.stroke();}ui.restore();ui.globalAlpha=1;
  ui.strokeStyle=INK;ui.lineWidth=2;ui.strokeRect(76,84,110,56);t2('18+',131,123,'32px Deco',INK);}
// ---------- кадры макета ----------
const project=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(cam);return[(v.x+1)/2*W,(1-v.y)/2*H];};
let extra=[];
window.shot=(kind)=>{extra.forEach(o=>scene.remove(o));extra=[];ICE.forEach(m=>scene.remove(m));scene.remove(bub);scene.remove(slice);
  frame2d();
  if(kind==='title'){setLevel(0);t2('COCKTAIL',540,205,'40px Deco',SOFT,16);t2('Апероль',540,335,'150px Script',INK);t2('Шприц',540,460,'150px Script',ORG);rule(505,420);t2('ИТАЛЬЯНСКИЙ АПЕРИТИВ',540,565,'34px Deco',SOFT,8);}
  if(kind==='pour'){const ly=setLevel(.62,0xF07A28);ICE.forEach(m=>scene.add(m));
    const b=bottle('ape');b.rotation.z=1.95;b.position.set(.78,2.55,.15);scene.add(b);extra.push(b);
    const mouth=new THREE.Vector3(0,1.05,0).applyMatrix4(new THREE.Matrix4().compose(b.position,new THREE.Quaternion().setFromEuler(b.rotation),new THREE.Vector3(1,1,1)));
    const s=new THREE.Mesh(new THREE.CylinderGeometry(.018,.024,mouth.y-ly,24),streamMat);s.position.set(mouth.x,(mouth.y+ly)/2,mouth.z);scene.add(s);extra.push(s);
    t2('ШАГ 3 ИЗ 6',540,220,'34px Deco',SOFT,10);rule(250,240);t2('60 мл',540,420,'180px Deco',ORG);t2('Апероль',540,520,'96px Script',INK);
    const[px,py]=project(R(260),ly,0);ui.strokeStyle=GOLD;ui.lineWidth=2;ui.beginPath();ui.moveTo(px+14,py);ui.lineTo(px+80,py);ui.stroke();ui.font='46px Deco';ui.fillStyle=ORG;ui.textAlign='left';ui.fillText('60 мл',px+90,py+14);}
  if(kind==='final'){setLevel(.9,0xF06A22);ICE.forEach(m=>scene.add(m));scene.add(slice);
    t2('Апероль Шприц',540,330,'140px Script',INK);rule(390,420);t2('ЛЁД · 90 · 60 · 30 · АПЕЛЬСИН',540,450,'34px Deco',SOFT,6);}
  renderer.render(scene,cam);};
window.ready=Promise.all([document.fonts.load('40px Deco'),document.fonts.load('40px Script')]).then(()=>true);
