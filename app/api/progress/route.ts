import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {progress} from '../../../server/progress.js';
export const dynamic='force-dynamic';
async function handle(request:Request){try{return await progress(request,env.DB,await getChatGPTUser());}catch{return Response.json({error:'Server tidak dapat menyimpan progres. Coba lagi.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
export const GET=handle;export const POST=handle;
