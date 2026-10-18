import {ROOM} from './interactions';
import {buildings} from './world';
import {makeScholar} from './sprites';
export function drawInterior(scene,room){
 const b=buildings.find(b=>b.id===room),g=scene.add.graphics();
 const r=(x,y,w,h,c)=>g.fillStyle(c).fillRect(x,y,w,h);
 const text=(x,y,t,size=13,color='#e8e0c8')=>scene.add.text(x,y,t,{fontFamily:'monospace',fontSize:size,color,align:'center'}).setOrigin(.5);
 const floor=room==='pk'?0x253e46:room==='pm'?0x46404b:0x263a4c;
 r(0,0,ROOM.width,ROOM.height,0x14232c);
 for(let y=64;y<720;y+=32)for(let x=48;x<912;x+=32){r(x,y,31,31,floor);if(room==='pm')r(x,y+25,31,2,0x57505a);}
 r(32,32,896,45,0x52656a);r(32,32,16,704,0x52656a);r(912,32,16,704,0x52656a);r(32,720,896,16,0x52656a);
 r(400,390,160,330,room==='pk'?0x345851:room==='pm'?0x63506d:0x3a5267);
 r(410,400,140,310,room==='pk'?0x3a635d:room==='pm'?0x715a7d:0x425f76);
 text(480,105,b.name,19);text(480,132,'THE SCHOLAR’S GUILD',10,'#a9b8b8');
 for(const x of [72,788]){
  r(x,120,100,360,0x172b33);
  if(room==='pm'){
   for(let row=0;row<6;row++){r(x+5,135+row*55,90,6,0xb39463);for(let col=0;col<7;col++)r(x+9+col*12,143+row*55,8,35,[0x9e778d,0x789598,0xb39f73][(row+col)%3]);}
  }else if(room==='pk'){
   for(let row=0;row<5;row++){r(x+8,131+row*68,84,56,0x36535b);r(x+17,140+row*68,50,35,0x73b9af);r(x+75,143+row*68,5,5,0xb7edb9);r(x+75,157+row*68,5,5,0x7d9ea6);}
  }else{
   for(let row=0;row<4;row++){r(x+7,135+row*86,86,68,0x45617b);for(let star=0;star<9;star++)r(x+17+(star*17)%64,143+row*86+(star*13)%48,2,2,0xe2d5a5);}
  }
 }
 if(room==='pu'){
  g.lineStyle(2,0x8b9fa5,.6).strokeCircle(480,260,78).strokeCircle(480,260,50);
  g.lineBetween(402,260,558,260).lineBetween(480,182,480,338);
  r(465,235,30,50,0xb8b28e);r(476,210,9,80,0x7692a8);
 }else if(room==='pk'){
  r(385,195,190,105,0x172d36);r(393,203,174,89,0x3e7277);
  text(480,239,'x² + y²',25,'#b0e5d5');text(480,273,'QUANTUM LAB',10,'#a8ceca');
 }else{
  r(403,190,154,112,0x8e755b);r(415,204,62,80,0xe0d1a4);r(483,204,62,80,0xd7c697);r(478,201,4,87,0x5b4a46);
  for(let y=220;y<278;y+=13){r(424,y,43,2,0xa29172);r(492,y,43,2,0xa29172);}
 }
 // Station and teacher desk footprints align with collision data.
 r(200,285,140,65,0x8a826a);r(205,290,130,48,0xaca182);r(235,261,70,40,0x1b3039);r(241,267,58,27,b.color);r(247,311,45,10,0x536467);
 text(270,365,'STATION LATIHAN',12);text(270,387,'10 SOAL · '+room.toUpperCase(),10,'#adc9bf');
 r(620,230,140,70,0x8d7256);r(625,235,130,52,0xb49b76);r(637,243,35,24,0xe0d2a5);r(706,243,33,24,0x476765);
 const key=`teacher-${room}`;if(!scene.textures.exists(key))scene.textures.addCanvas(key,makeScholar(room==='pk'?'hacker':room==='pm'?'mage':'analyst'));
 scene.add.image(690,209,key).setScale(1.7);
 text(690,316,'GURU UTAMA',12);text(690,337,'20 SOAL · PK / PM / PU',10,'#dcc69c');
 r(439,705,82,28,0x172b31);r(446,709,68,16,0x87a697);text(480,682,'↓ KELUAR',12);
 text(480,566,'Dekati station atau guru',12,'#bac7bf');text(480,587,'E / SPACE untuk berinteraksi',10,'#91aaa7');
}
