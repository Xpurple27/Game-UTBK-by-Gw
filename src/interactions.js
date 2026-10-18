import {buildings} from './world.js';
export const ROOM={width:960,height:768,spawn:{x:480,y:630}};
export const roomObstacles=[{x:200,y:285,w:140,h:65},{x:620,y:230,w:140,h:70},{x:72,y:120,w:100,h:360},{x:788,y:120,w:100,h:360}];
export const doors=buildings.map(b=>({id:`door-${b.id}`,kind:'door',room:b.id,x:b.x+b.w/2,y:b.y+b.h+36,radius:62,label:`Masuk ${b.name}`}));
export function roomTargets(room){if(!buildings.some(b=>b.id===room))return [];return[
 {id:`${room}-practice`,kind:'practice',room,x:270,y:383,radius:65,label:`Station Latihan ${room.toUpperCase()}`,count:10,subtests:[room.toUpperCase()]},
 {id:`${room}-boss`,kind:'boss',room,x:690,y:333,radius:65,label:'Boss Desk · Guru Utama',count:20,subtests:['PK','PM','PU']},
 {id:`${room}-exit`,kind:'exit',room,x:480,y:690,radius:64,label:'Kembali ke kampus'}
];}
export function nearestTarget(targets,x,y){return targets.map(t=>({t,d:Math.hypot(t.x-x,t.y-y)})).filter(({t,d})=>d<=t.radius).sort((a,b)=>a.d-b.d)[0]?.t??null;}
export function outsideSpawn(room){const b=buildings.find(b=>b.id===room);if(!b)throw new Error('Unknown room');return{x:b.x+b.w/2,y:b.y+b.h+75};}
export function sessionPreview(target){if(!target||!['practice','boss'].includes(target.kind))return null;return{...target,title:target.kind==='practice'?`Latihan ${target.room.toUpperCase()}`:'Mini Tryout Campuran',description:target.kind==='practice'?'Latihan terarah untuk satu subtes.':'Tantangan gabungan Pengetahuan Kuantitatif, Penalaran Matematika, dan Penalaran Umum.'};}
