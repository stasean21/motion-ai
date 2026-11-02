const fs=require('fs');global.window=global;const topojson=require('/home/user/motion-ai/projects/guess-country-balls/src/lib/topojson-client.min.js');eval(fs.readFileSync('/home/user/motion-ai/projects/guess-country-balls/src/lib/world10m.js','utf8').replace('const WORLD10','global.WORLD10'));
const t=topojson.feature(WORLD10,WORLD10.objects.countries);
const keep=t.features.filter(f=>['124','840','484'].includes(String(f.id)));
console.log(keep.map(f=>f.id+' '+(f.properties&&f.properties.name)));
fs.writeFileSync('/tmp/claude-0/-home-user-motion-ai/82cc3cdc-830f-567a-9b23-e76e7028cb80/scratchpad/geotz/land.geojson',JSON.stringify({type:'FeatureCollection',features:keep}));
