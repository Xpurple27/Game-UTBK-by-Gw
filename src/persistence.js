import {validProfile} from './profile.js';
import {questionBank,quizFor} from './questions.js';
import {WORLD,obstacles} from './world.js';
import {ROOM,roomObstacles} from './interactions.js';
export const SAVE_KEY='utbk-quest:progress:v1';
export const HISTORY_LIMIT=100;
const ids=['hacker','mage','analyst'];
const bank=new Map(questionBank.map(q=>[q.id,q]));
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=v=>Number.isFinite(v)&&v>=0;
function requireValue(ok){if(!ok)throw new Error('Invalid saved progress');}
export function safeLocation(value){
 const room=['pk','pm','pu'].includes(value?.room)?value.room:null;
 const bounds=room?ROOM:WORLD,solid=room?roomObstacles:obstacles;
 const fallback={room,...bounds.spawn};
 if(!Number.isFinite(value?.x)||!Number.isFinite(value?.y))return fallback;
 const x=value.x,y=value.y;
 if(x<59.8||x>bounds.width-59.8||y<55.4||y>bounds.height-73.4)return fallback;
 if(solid.some(o=>x+11.8>o.x&&x-11.8<o.x+o.w&&y+25.4>o.y&&y+8.6<o.y+o.h))return fallback;
 return {room,x,y};
}
const packResult=r=>r?{...r,rows:r.rows.map(({question,...row})=>({...row,questionId:question.id}))}:null;
function unpackResult(r){
 requireValue(object(r)&&Array.isArray(r.rows)&&r.rows.length>0&&r.rows.length<=20);
 for(const k of ['correct','wrong','unanswered','total','accuracy','baseScore','bonus','earnedScore','earnedCoins','elapsed'])requireValue(number(r[k]));
 const rows=r.rows.map(row=>{const question=bank.get(row.questionId);requireValue(question&&(row.answer===null||question.options.some(o=>o.id===row.answer)));return {question,answer:row.answer,correct:row.answer===question.correctOptionId};});
 requireValue(r.total===rows.length&&r.correct===rows.filter(r=>r.correct).length&&r.correct+r.wrong+r.unanswered===r.total);
 requireValue(['submitted','timeout'].includes(r.reason));
 const breakdown=['PK','PM','PU'].map(subtest=>{const items=rows.filter(r=>r.question.subtest===subtest);return {subtest,total:items.length,correct:items.filter(r=>r.correct).length};}).filter(b=>b.total);
 return {...r,rows,breakdown};
}
function packSession(s){if(!s)return null;const {questions,remaining,...rest}=s;return {...rest,questionIds:questions.map(q=>q.id),result:packResult(s.result)};}
function unpackSession(s,character,now){
 if(s===null)return null;
 requireValue(object(s)&&ids.includes(character)&&typeof s.attemptId==='string'&&typeof s.id==='string'&&['practice','boss'].includes(s.mode));
 requireValue(Array.isArray(s.questionIds)&&[10,20].includes(s.questionIds.length)&&new Set(s.questionIds).size===s.questionIds.length);
 const [mode,room]=s.id.split(':');requireValue(s.id===`${mode}:${room}`&&mode===s.mode);
 const expected=quizFor({kind:mode,room});requireValue(expected.questions.map(q=>q.id).join(',')===s.questionIds.join(','));
 const questions=s.questionIds.map(id=>{requireValue(bank.has(id));return bank.get(id);});
 requireValue(['active','finished'].includes(s.status)&&number(s.startedAt)&&number(s.deadline)&&s.deadline>s.startedAt&&Number.isInteger(s.index)&&s.index>=0&&s.index<questions.length);
 requireValue(object(s.answers)&&object(s.hiddenOptions)&&object(s.hints)&&Array.isArray(s.flags)&&typeof s.skillUsed==='boolean');
 const answers={},hiddenOptions={},hints={};
 for(const q of questions){
  if(s.answers[q.id]!==undefined){requireValue(q.options.some(o=>o.id===s.answers[q.id]));answers[q.id]=s.answers[q.id];}
  if(s.hiddenOptions[q.id]){const hidden=s.hiddenOptions[q.id];requireValue(Array.isArray(hidden)&&hidden.length===2&&new Set(hidden).size===2&&hidden.every(id=>id!==q.correctOptionId&&q.options.some(o=>o.id===id)));hiddenOptions[q.id]=hidden;}
  if(s.hints[q.id])hints[q.id]=q.hint;
 }
 const result=s.status==='finished'?unpackResult(s.result):null;
 return {...s,questions,answers,hiddenOptions,hints,flags:s.flags.filter(id=>questions.some(q=>q.id===id)),remaining:Math.max(0,Math.ceil((s.deadline-now)/1000)),result};
}
export function snapshot(state){
 return {profile:state.profile??null,selectedCharacter:state.selectedCharacter,confirmed:state.confirmed,score:state.score,coins:state.coins,inventory:state.inventory,subtestsCompleted:state.subtestsCompleted,location:state.location,history:state.history.slice(0,HISTORY_LIMIT).map(h=>({...h,result:packResult(h.result)})),session:packSession(state.session)};
}
export function decodeSave(raw,now){
 requireValue(typeof raw==='string'&&raw.length<2000000);
 const envelope=JSON.parse(raw);requireValue(envelope.version===1&&envelope.bankVersion===1&&number(envelope.savedAt));
 const d=envelope.data;requireValue(object(d)&&(d.selectedCharacter===null||ids.includes(d.selectedCharacter))&&typeof d.confirmed==='boolean'&&number(d.score)&&number(d.coins));
 requireValue(!d.confirmed||ids.includes(d.selectedCharacter));
 requireValue(Array.isArray(d.history)&&d.history.length<=HISTORY_LIMIT&&Array.isArray(d.inventory)&&d.inventory.length<=100&&d.inventory.every(v=>typeof v==='string')&&Array.isArray(d.subtestsCompleted));
 const history=d.history.map(h=>{requireValue(object(h)&&typeof h.id==='string'&&number(h.finishedAt)&&ids.includes(h.characterId)&&typeof h.title==='string'&&h.title.length<100&&typeof h.skillUsed==='boolean');return {...h,result:unpackResult(h.result)};});
 requireValue(new Set(history.map(h=>h.id)).size===history.length);
 const session=unpackSession(d.session,d.selectedCharacter,now);
 requireValue(!session||d.confirmed);
 if(session)requireValue(session.status==='finished'?history.some(h=>h.id===session.attemptId):!history.some(h=>h.id===session.attemptId));
 return {profile:validProfile(d.profile)?{playerId:d.profile.playerId,displayName:d.profile.displayName,createdAt:d.profile.createdAt}:null,selectedCharacter:d.selectedCharacter,confirmed:d.confirmed,score:d.score,coins:d.coins,inventory:d.inventory,subtestsCompleted:d.subtestsCompleted.filter(s=>['PK','PM','PU'].includes(s)),location:safeLocation(d.location),history,session,lastSavedAt:envelope.savedAt};
}
export function connectPersistence(store,storage,clock){
 if(!storage){store.setState({saveStatus:'unavailable',saveMessage:'Penyimpanan browser tidak tersedia. Progres hanya bertahan selama halaman terbuka.'});return;}
 let lastRaw=null,loadingError=false;
 try{lastRaw=storage.getItem(SAVE_KEY);if(lastRaw){const restored=decodeSave(lastRaw,clock());store.setState({...restored,saveStatus:'saved',saveMessage:''});}}
 catch{loadingError=true;store.setState({saveStatus:'error',saveMessage:'Simpanan tidak dapat dibaca. Progres lama belum diubah; permainan baru akan disimpan saat kamu mulai bermain.'});}
 let lastData=JSON.stringify(snapshot(store.getState())),writing=false;
 const write=()=>{
  if(store.cloudMode||writing||store.getState().saveStatus==='conflict')return;
  const data=JSON.stringify(snapshot(store.getState()));if(data===lastData)return;
  lastData=data;writing=true;
  try{
   if(storage.getItem(SAVE_KEY)!==lastRaw){store.setState({saveStatus:'conflict',saveMessage:'Progres berubah di tab lain. Muat ulang halaman ini sebelum melanjutkan agar simpanan tidak tertimpa.'});return;}
   const savedAt=clock();const raw=JSON.stringify({version:1,bankVersion:1,savedAt,data:JSON.parse(data)});
   storage.setItem(SAVE_KEY,raw);lastRaw=raw;store.setState({lastSavedAt:savedAt,saveStatus:'saved',saveMessage:''});
  }catch{store.setState({saveStatus:'error',saveMessage:'Autosave gagal. Penyimpanan mungkin penuh atau diblokir. Jangan tutup halaman sebelum penyimpanan berhasil.'});lastData='';}
  finally{writing=false;}
 };
 store.subscribe(write);
 store.checkExternalSave=()=>{if(store.cloudMode)return;try{if(storage.getItem(SAVE_KEY)!==lastRaw)store.setState({saveStatus:'conflict',saveMessage:'Progres berubah di tab lain. Muat ulang untuk menggunakan simpanan terbaru.'});}catch{store.setState({saveStatus:'error',saveMessage:'Penyimpanan browser tidak dapat diakses.'});}};
 store.retrySave=()=>{lastData='';write();};
 // Expired restored attempts are finalized once, then persisted atomically with rewards/history.
 if(!loadingError)store.getState().tick();
}
export function browserStorage(){try{return typeof window==='undefined'?null:window.localStorage;}catch{return null;}}
