import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {progress} from './progress.js';
import {createGameStore} from '../src/store.js';
import {snapshot} from '../src/persistence.js';
function database(){const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE player_saves(user_id TEXT PRIMARY KEY,payload TEXT NOT NULL,revision INTEGER NOT NULL,updated_at INTEGER NOT NULL)');return {prepare(q){return {bind(...args){return {async first(){return sql.prepare(q).get(...args);},async run(){const r=sql.prepare(q).run(...args);return {meta:{changes:Number(r.changes)}};}};}};}};}
const user={userId:'alice'};
const save=()=>({version:1,bankVersion:1,savedAt:Date.now(),data:snapshot(createGameStore().getState())});
function post(body,origin='https://quest.test'){return new Request('https://quest.test/api/progress',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});}
const get=()=>new Request('https://quest.test/api/progress');
test('anonymous and cross-origin writes rejected; payload cannot choose a different account',async()=>{const db=database(),body={userId:'alice',revision:0,save:save()};assert.equal((await progress(get(),db,null)).status,401);assert.equal((await progress(post(body,'https://evil.test'),db,user)).status,403);assert.equal((await progress(post({...body,userId:'bob'}),db,user)).status,403);});
test('two devices restore exact progress; other account cannot read it',async()=>{const db=database(),s=save();s.data.score=200;assert.equal((await progress(post({userId:'alice',revision:0,save:s}),db,user)).status,200);const a=await (await progress(get(),db,user)).json();assert.equal(a.save.data.score,200);assert.equal(a.revision,1);const b=await (await progress(get(),db,{userId:'bob'})).json();assert.equal(b.save,null);});
test('stale revision and duplicate import never overwrite or add rewards',async()=>{const db=database(),s=save();s.data.score=200;const body={userId:'alice',revision:0,save:s};await progress(post(body),db,user);assert.equal((await progress(post(body),db,user)).status,409);s.data.score=300;assert.equal((await progress(post({...body,revision:1}),db,user)).status,200);assert.equal((await progress(post({...body,revision:1}),db,user)).status,409);const a=await (await progress(get(),db,user)).json();assert.equal(a.save.data.score,300);assert.equal(a.revision,2);});
test('invalid schema rejected before mutation',async()=>{const db=database();assert.equal((await progress(post({userId:'alice',revision:0,save:{}}),db,user)).status,400);assert.equal((await (await progress(get(),db,user)).json()).save,null);});
