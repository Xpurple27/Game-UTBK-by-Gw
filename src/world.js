export const WORLD = {width:1440,height:1088,spawn:{x:720,y:900},baseSpeed:180};
export const buildings = [
 {id:'pk',name:'LABORATORIUM PK',subtitle:'Pengetahuan Kuantitatif',x:130,y:230,w:300,h:220,color:0x75d8bc},
 {id:'pm',name:'PERPUSTAKAAN PM',subtitle:'Penalaran Matematika',x:570,y:110,w:300,h:240,color:0xc1acfa},
 {id:'pu',name:'OBSERVATORIUM PU',subtitle:'Penalaran Umum',x:1010,y:230,w:300,h:220,color:0xefc678}
];
export const trees = [[80,130],[190,120],[390,110],[1020,110],[1250,120],[1360,130],[80,530],[1360,530],[120,700],[1320,700],[200,900],[1240,900],[400,950],[1040,950],[500,470],[940,470],[80,990],[1360,990]];
export const obstacles = [
 ...buildings.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h})),
 {x:655,y:550,w:130,h:100},
 ...trees.map(([x,y])=>({x:x-12,y:y-9,w:24,h:25})),
 {x:430,y:730,w:100,h:28},{x:910,y:730,w:100,h:28},
 {x:200,y:580,w:130,h:52},{x:1110,y:580,w:130,h:52}
];
export function movementVector(x,y,multiplier=1){const length=Math.hypot(x,y);return length?{x:x/length*WORLD.baseSpeed*multiplier,y:y/length*WORLD.baseSpeed*multiplier}:{x:0,y:0};}
export function zoneAt(x,y){const near=buildings.find(b=>Math.hypot(x-(b.x+b.w/2),y-(b.y+b.h+45))<150);return near?near.name:'HALAMAN AKADEMI';}
