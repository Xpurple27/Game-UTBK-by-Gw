import {createStore} from 'zustand/vanilla';
import {makeProfile} from './profile.js';
import {characters} from './characters.js';
import {quizFor} from './questions.js';
import {connectPersistence,browserStorage,safeLocation,HISTORY_LIMIT} from './persistence.js';
export const createGameStore = (clock=()=>Date.now(),storage=null) => {
const store=createStore((set,get)=>({
 profile:null,
 saveProfile(name){const profile=makeProfile(name,get().profile);if(!profile)return false;set({profile});return true;},
 selectedCharacter:null,confirmed:false,coins:0,score:0,inventory:[],subtestsCompleted:[],session:null,history:[],location:safeLocation(null),saveStatus:'ready',saveMessage:'',lastSavedAt:null,
 saveLocation(location){const next=safeLocation(location),old=get().location;if(old.room!==next.room||old.x!==next.x||old.y!==next.y)set({location:next});},
 selectCharacter(id){if(get().session || !characters.some(c=>c.id===id))return false;set({selectedCharacter:id,confirmed:false});return true;},
 confirmCharacter(){if(!get().selectedCharacter||get().session)return false;set({confirmed:true});return true;},
 startSession({id,duration,questions=[],title='',mode='practice'}){
  if(!get().confirmed||get().session||!id||!Number.isFinite(duration)||duration<=0)return false;
  const startedAt=clock();const attemptId=`${startedAt}-${globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2)}`;set({session:{attemptId,id,title,mode,questions,startedAt,deadline:startedAt+duration*1000,remaining:duration,status:'active',index:0,answers:{},flags:[],skillUsed:false,skillQuestionId:null,hiddenOptions:{},hints:{},result:null}});return true;
 },
 startQuiz(target){try{return get().startSession(quizFor(target));}catch{return false;}},
 tick(){const s=get().session;if(!s||s.status!=='active')return;const remaining=Math.max(0,Math.ceil((s.deadline-clock())/1000));if(remaining!==s.remaining)set({session:{...s,remaining}});if(remaining===0&&s.questions.length)get().finishSession('timeout');},
 answer(optionId){get().tick();const s=get().session;if(!s||s.status!=='active'||s.remaining<=0)return false;const q=s.questions[s.index];if(!q?.options.some(o=>o.id===optionId)||s.hiddenOptions[q.id]?.includes(optionId))return false;set({session:{...s,answers:{...s.answers,[q.id]:optionId}}});return true;},
 goTo(index){get().tick();const s=get().session;if(!s||s.status!=='active'||!Number.isInteger(index)||index<0||index>=s.questions.length)return false;set({session:{...s,index}});return true;},
 toggleFlag(){get().tick();const s=get().session;if(!s||s.status!=='active')return;const id=s.questions[s.index]?.id;if(!id)return;set({session:{...s,flags:s.flags.includes(id)?s.flags.filter(v=>v!==id):[...s.flags,id]}});},
 useSkill(question){
  const before=get().session;if(!before||before.remaining<=0)return false;get().tick();
  const {session:s,selectedCharacter:id}=get();if(!s||s.status!=='active'||s.skillUsed||s.remaining<=0)return false;
  const q=s.questions.length?s.questions[s.index]:question;
  let next={...s,skillUsed:true,skillQuestionId:q?.id??null};
  if(id==='mage'){next.deadline+=30000;next.remaining=Math.max(0,Math.ceil((next.deadline-clock())/1000));}
  else {if(!q?.id)return false;
   if(id==='hacker'){
    if(!Array.isArray(q.options)||q.options.length!==5||!q.options.some(o=>o.id===q.correctOptionId)||new Set(q.options.map(o=>o.id)).size!==5)return false;
    const wrong=q.options.filter(o=>o.id!==q.correctOptionId).slice(0,2).map(o=>o.id);
    next.hiddenOptions={...s.hiddenOptions,[q.id]:wrong};
    if(wrong.includes(s.answers[q.id])){next.answers={...s.answers};delete next.answers[q.id];}
   }else if(id==='analyst'){if(!q.hint?.trim())return false;next.hints={...s.hints,[q.id]:q.hint};}else return false;
  }
  set({session:next});return true;
 },
 finishSession(reason='submitted'){
  const s=get().session;if(!s||s.status!=='active'||!s.questions.length)return false;
  if(get().history.some(h=>h.id===s.attemptId))return false;
  const now=clock(),expired=now>=s.deadline;
  const rows=s.questions.map(q=>({question:q,answer:s.answers[q.id]??null,correct:s.answers[q.id]===q.correctOptionId}));
  const correct=rows.filter(r=>r.correct).length,answered=rows.filter(r=>r.answer!==null).length;
  const bonus=get().selectedCharacter==='hacker'?rows.filter(r=>r.correct&&r.question.subtest==='PK').length*10:0;
  const earnedScore=correct*100+bonus,earnedCoins=correct*5;
  const breakdown=['PK','PM','PU'].map(subtest=>{const items=rows.filter(r=>r.question.subtest===subtest);return{subtest,total:items.length,correct:items.filter(r=>r.correct).length};}).filter(r=>r.total);
  // Completion records finished attempts, not mastery or official exam performance.
  const completed=[...new Set([...get().subtestsCompleted,...s.questions.map(q=>q.subtest)])];
  const result={reason:expired?'timeout':reason,correct,wrong:answered-correct,unanswered:rows.length-answered,total:rows.length,accuracy:Math.round(correct/rows.length*100),baseScore:correct*100,bonus,earnedScore,earnedCoins,elapsed:Math.floor((Math.min(now,s.deadline)-s.startedAt)/1000),rows,breakdown};
  const entry={id:s.attemptId,title:s.title||s.id,stationId:s.id,mode:s.mode,characterId:get().selectedCharacter,finishedAt:now,skillUsed:s.skillUsed,skillQuestionId:s.skillQuestionId??null,result};
  set({history:[entry,...get().history].slice(0,HISTORY_LIMIT),score:get().score+earnedScore,coins:get().coins+earnedCoins,subtestsCompleted:completed,session:{...s,status:'finished',remaining:Math.max(0,Math.ceil((s.deadline-now)/1000)),result}});return true;
 },
 endSession(){set({session:null});},
 getPassive(){const c=characters.find(c=>c.id===get().selectedCharacter);return {speedMultiplier:c?.speed??1,pkBonus:c?.id==='hacker'?10:0,showDifficulty:c?.id==='analyst'};}
}));
if(storage!==null)connectPersistence(store,storage,clock);
return store;
};
export const gameStore=createGameStore(()=>Date.now(),browserStorage()??false);
if(typeof window!=='undefined')window.addEventListener('storage',()=>gameStore.checkExternalSave?.());
