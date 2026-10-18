import React from 'react';
import {useStore} from 'zustand';
import {gameStore} from './store';
export default function SaveStatus(){
 const status=useStore(gameStore,s=>s.saveStatus),message=useStore(gameStore,s=>s.saveMessage);
 if(gameStore.cloudMode)return null;
 const problem=['error','unavailable','conflict'].includes(status);
 return <div className={'save-status '+(problem?'save-error':'')} role="status"><span>{problem?'!':status==='saved'?'✓':'◇'}</span><span>{problem?message:status==='saved'?'Progres tersimpan otomatis di browser ini':'Autosave siap · tersimpan di perangkat ini'}</span>{status==='error'&&<button onClick={()=>gameStore.retrySave?.()}>Coba simpan lagi</button>}{status==='conflict'&&<button onClick={()=>window.location.reload()}>Muat ulang</button>}</div>;
}
