// Original 32x32 Canvas placeholders. Replace texture generation with a spritesheet in milestone 2.
export function makeScholar(id){const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const c=canvas.getContext('2d');const color={hacker:'#75d8bc',mage:'#b9a0ef',analyst:'#edc273'}[id];const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
 r(7,29,19,2,'#0c1420');r(11,23,4,6,'#24364e');r(19,23,4,6,'#24364e');r(9,28,6,2,'#b3bbca');r(19,28,6,2,'#b3bbca');r(9,15,16,10,color);r(7,17,3,8,color);r(25,17,3,8,color);r(10,5,15,11,'#e8b68e');r(9,3,17,5,'#263346');r(9,7,3,7,'#263346');r(23,7,3,7,'#263346');r(14,10,2,2,'#172636');r(20,10,2,2,'#172636');r(16,14,4,1,'#a56f60');r(15,16,5,8,'#e8e2ca');r(10,24,15,2,'#344252');
 if(id==='hacker'){r(12,9,12,3,'#447d82');r(13,9,4,2,'#a9ffea');r(20,9,4,2,'#a9ffea');r(25,20,6,7,'#344c62');r(26,21,4,3,color);}
 if(id==='mage'){r(7,6,21,3,color);r(11,3,13,3,color);r(15,0,5,3,color);r(28,12,2,17,'#be965d');r(27,9,4,4,'#ede4ff');}
 if(id==='analyst'){r(10,3,16,3,'#b99050');r(8,6,20,2,'#e9c274');r(24,19,7,7,'#876341');r(25,20,5,5,'#f5e2a4');}
 return canvas;}
