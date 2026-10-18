export function guestId(){
 if(globalThis.crypto?.randomUUID)return `guest-${globalThis.crypto.randomUUID()}`;
 const bytes=globalThis.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `guest-${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function nickname(value){
 if(typeof value!=='string')return '';
 return value.normalize('NFKC').replace(/\s+/gu,' ').trim();
}
export function nicknameError(value){
 const name=nickname(value),length=Array.from(name).length;
 if(length<2||length>20)return 'Gunakan 2–20 karakter.';
 if(!/^[\p{L}\p{N} ._-]+$/u.test(name))return 'Gunakan huruf, angka, spasi, titik, garis bawah, atau tanda hubung.';
 return '';
}
export function validProfile(p){return p&&typeof p.playerId==='string'&&/^guest-[a-f0-9-]{36}$/.test(p.playerId)&&typeof p.displayName==='string'&&!nicknameError(p.displayName)&&Number.isFinite(p.createdAt);}
export function makeProfile(displayName,previous=null){
 if(nicknameError(displayName))return null;
 return {playerId:previous?.playerId??guestId(),displayName:nickname(displayName),createdAt:previous?.createdAt??Date.now()};
}
