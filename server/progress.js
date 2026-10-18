import {decodeSave,snapshot} from '../src/persistence.js';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store, private','Vary':'Cookie'}});
export async function progress(request,db,user){
 if(!user)return json({user:null},401);
 if(!db)return json({error:'Penyimpanan online belum tersedia.'},503);
 if(request.method==='GET'){
  const row=await db.prepare('SELECT payload, revision, updated_at FROM player_saves WHERE user_id = ?').bind(user.userId).first();
  return json({user:{id:user.userId},save:row?JSON.parse(row.payload):null,revision:row?.revision??0,updatedAt:row?.updated_at??null});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Origin tidak diizinkan.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 const raw=await request.text();if(raw.length>2000000)return json({error:'Simpanan terlalu besar.'},413);
 let input,canonical;
 try{input=JSON.parse(raw);if(input.userId!==user.userId)return json({error:'Akun telah berubah.'},403);if(!Number.isSafeInteger(input.revision)||input.revision<0)throw Error();canonical={version:1,bankVersion:1,savedAt:Date.now(),data:snapshot(decodeSave(JSON.stringify(input.save),Date.now()))};}catch{return json({error:'Format progres tidak valid.'},400);}
 const payload=JSON.stringify(canonical),now=Date.now();
 const query=input.revision===0?db.prepare('INSERT INTO player_saves (user_id,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING').bind(user.userId,payload,now):db.prepare('UPDATE player_saves SET payload = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(payload,now,user.userId,input.revision);
 const result=await query.run();
 if(result.meta.changes!==1)return json({error:'Progres akun berubah di perangkat lain. Muat ulang sebelum melanjutkan.'},409);
 return json({revision:input.revision+1,updatedAt:now});
}
