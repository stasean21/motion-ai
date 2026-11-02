const fs=require('fs'),Pbf=require('pbf'),geobuf=require('geobuf');
const D=process.argv[2], idx=JSON.parse(fs.readFileSync(D+'/timezones.geojson.index.json')), fd=fs.openSync(D+'/timezones.geojson.geo.dat','r');
const BOX=[-172,12,-50,84]; const out=[];
function rec(node,t,b,l,r){
  if(r<BOX[0]||l>BOX[2]||t<BOX[1]||b>BOX[3])return;
  if(Array.isArray(node)){ if(node.length===1) out.push({type:'Feature',properties:{tzid:idx.timezones[node[0]]},geometry:{type:'Polygon',coordinates:[[[l,b],[r,b],[r,t],[l,t],[l,b]]]}}); return;}
  if(node.pos>=0&&node.len){const buf=Buffer.alloc(node.len);fs.readSync(fd,buf,0,node.len,node.pos);const g=geobuf.decode(new Pbf(buf));for(const f of g.features)out.push({type:'Feature',properties:{tzid:f.properties.tzid},geometry:f.geometry});return;}
  const ml=(t+b)/2,mo=(l+r)/2;
  if(node.a)rec(node.a,t,ml,mo,r); if(node.b)rec(node.b,t,ml,l,mo); if(node.c)rec(node.c,ml,b,l,mo); if(node.d)rec(node.d,ml,b,mo,r);
}
rec(idx.lookup,89.9999,-89.9999,-179.9999,179.9999);
fs.writeFileSync(process.argv[3],JSON.stringify({type:'FeatureCollection',features:out}));
console.log(out.length,[...new Set(out.map(f=>f.properties.tzid))].filter(z=>z.startsWith('America')).length);
