import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameStore} from './store.js';
import {nicknameError} from './profile.js';
import {decodeSave,snapshot} from './persistence.js';
test('nickname validation rejects markup, controls and invisible bidi characters',()=>{
 for(const name of ['a','<script>','abc\u202Edef','abc\u200Bdef','x'.repeat(21)])assert.ok(nicknameError(name));
 assert.equal(nicknameError(' Wafiq_27 '),'');assert.equal(nicknameError('أحمد'),'');
});
test('renaming preserves identity and rewards, profile survives reload',()=>{
 const store=createGameStore();store.setState({score:300,coins:15});assert.ok(store.getState().saveProfile(' Wafiq  27 '));
 const id=store.getState().profile.playerId;store.getState().saveProfile('Scholar');assert.equal(store.getState().profile.playerId,id);
 const raw=JSON.stringify({version:1,bankVersion:1,savedAt:123,data:snapshot(store.getState())});
 const restored=decodeSave(raw,123);assert.equal(restored.profile.displayName,'Scholar');assert.equal(restored.profile.playerId,id);assert.equal(restored.score,300);
});
test('legacy saves without profile retain progress and invalid profiles are discarded',()=>{
 const data=snapshot(createGameStore().getState());data.score=100;delete data.profile;
 const raw=()=>JSON.stringify({version:1,bankVersion:1,savedAt:123,data});
 assert.equal(decodeSave(raw(),123).profile,null);data.profile={playerId:'fake',displayName:'Test'};
 assert.equal(decodeSave(raw(),123).profile,null);assert.equal(decodeSave(raw(),123).score,100);
});
test('account mode never writes account progress into the guest save',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 const store=createGameStore(()=>123,storage);store.getState().saveProfile('Guest');
 const original=[...memory.values()][0];store.cloudMode=true;store.getState().saveProfile('Account');store.setState({score:900});store.retrySave();assert.equal([...memory.values()][0],original);
 const guest=createGameStore(()=>123,storage);assert.equal(guest.getState().profile.displayName,'Guest');assert.equal(guest.getState().score,0);
});
