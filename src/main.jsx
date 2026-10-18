import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useStore} from 'zustand';
import {gameStore} from './store';
import {characters} from './characters';
import Portrait from './Portrait';
import Overworld from './Overworld';
import LearningJournal from './LearningJournal';
import PlayerProfile from './PlayerProfile';
import SaveStatus from './SaveStatus';
import './style.css';
import CloudGate from './CloudGate';
function App(){
 const s=useStore(gameStore);
 const [profileOpen,setProfileOpen]=useState(false),[pendingEnter,setPendingEnter]=useState(false);
 const [help,setHelp]=useState(false),[journal,setJournal]=useState(false);
 const [exploring,setExploring]=useState(!!gameStore.getState().session);
 const [choosing,setChoosing]=useState(!gameStore.getState().confirmed);
 const selected=characters.find(c=>c.id===s.selectedCharacter);
 if(exploring)return <Overworld onExit={()=>{setExploring(false);setChoosing(false);}}/>;
 const enterWorld=()=>{if(s.session){s.tick();setExploring(true);}else if(s.confirmCharacter())setExploring(true);};
 const enter=()=>{if(!s.profile){setPendingEnter(true);setProfileOpen(true);}else enterWorld();};
 return <div className="app"><header><a href="/" target="_top" className="brand"><span className="brand-icon">✦</span><span>UTBK <b>QUEST</b><small>THE SCHOLAR'S GUILD</small></span></a><div className="header-right"><button className="journal-header-button" onClick={()=>{setPendingEnter(false);setProfileOpen(true);}}>{s.profile?`◉ ${s.profile.displayName}`:'◉ Profil pemain'}</button><button className="journal-header-button" onClick={()=>setJournal(true)}>▤ Jurnal belajar</button><button className="help" onClick={()=>setHelp(true)} aria-label="Panduan pemilihan karakter">?</button></div></header>
 <main><div className="eyebrow"><span/> AKADEMI PARA PENJELAJAH <span/></div><h1>{s.confirmed&&!choosing?<>Perjalananmu<br/><em>belum berakhir.</em></>:<>Setiap legenda dimulai<br/>dengan <em>sebuah pilihan.</em></>}</h1><p className="intro">{s.confirmed&&!choosing?'Kembali ke akademi. Tinjau kesalahan. Tumbuh selangkah lagi.':'Pilih keahlianmu. Bangun strategimu. Perjalanan menaklukkan UTBK dimulai di sini.'}</p><SaveStatus/>
 {s.confirmed&&!choosing&&selected?<section className="resume-card" style={{'--accent':selected.color}}><div className="resume-portrait"><Portrait id={selected.id} color={selected.color}/><span className="role">{selected.role}</span><h2>{selected.name}</h2></div><div className="resume-details"><div className="eyebrow">PETUALANGAN TERSIMPAN</div><h3>Siap melangkah lagi?</h3><p>Posisi terakhir: <b>{s.location.room?`Gedung ${s.location.room.toUpperCase()}`:'Halaman akademi'}</b>.</p><div className="resume-stats"><span><b>{s.score}</b> poin</span><span><b>{s.coins}</b> koin</span><span><b>{s.history.length}</b> sesi tersimpan</span></div><button className="primary" onClick={enter}>Lanjutkan Petualangan →</button><div className="resume-links"><button onClick={()=>setJournal(true)}>Buka jurnal belajar</button><button onClick={()=>setChoosing(true)}>Ganti karakter</button></div><small>Ganti karakter tetap mempertahankan poin, koin, dan riwayat.</small></div></section>:<>
 <div className="step"><span>01</span> PILIH KARAKTER <i/> <span className="muted">02</span><b className="muted">JELAJAHI AKADEMI</b></div><div className="cards" role="group" aria-label="Pilih karakter">{characters.map((c,i)=><button key={c.id} className={'card '+(s.selectedCharacter===c.id?'selected':'')} style={{'--accent':c.color}} onClick={()=>s.selectCharacter(c.id)} aria-pressed={s.selectedCharacter===c.id}><div className="card-top"><span>CLASS 0{i+1}</span><span className="class-badge">{c.code}</span></div><Portrait id={c.id} color={c.color}/><div className="card-content"><div className="role">{c.role}</div><h2>{c.name}</h2><p className="description">{c.description}</p><div className="skill"><span className="skill-icon">{c.icon}</span><div><small>ACTIVE SKILL <b>1× / SESI</b></small><h3>{c.skill}</h3></div></div><p className="effect">{c.effect}</p><div className="passive"><span>✧</span><p>{c.passive}</p></div><div className="choose"><span>{s.selectedCharacter===c.id?'Karakter dipilih':'Pilih karakter'}</span><span>{s.selectedCharacter===c.id?'✓':'→'}</span></div></div></button>)}</div><div className="action-area"><p><span>◇</span> Tiga keahlian berbeda. Satu tujuan yang sama.</p><button className="primary disabled:opacity-40" disabled={!selected} onClick={enter}>{selected?'Jelajahi sebagai '+selected.name.replace('The ',''):'Pilih karaktermu dahulu'} <span>→</span></button><small>Skill aktif dapat digunakan satu kali di setiap sesi latihan atau tryout.</small></div>
 </>}
 <p className="local-save-note">{gameStore.cloudMode?'Mode akun: periksa status penyimpanan online di bagian atas.':'Progres tamu tersimpan di browser ini.'}</p></main><footer><span>✦ THE SCHOLAR'S GUILD</span><span>Latih pikiran. Naikkan level. Raih tujuan.</span><span>MILESTONE 06B · CLOUD SAVE</span></footer>
 {profileOpen&&<PlayerProfile onClose={()=>setProfileOpen(false)} onSaved={()=>{if(pendingEnter)enterWorld();}}/>}
 {journal&&<LearningJournal onClose={()=>setJournal(false)}/>}
 {help&&<div className="backdrop" onClick={()=>setHelp(false)}><section role="dialog" aria-modal="true" aria-labelledby="help-title" className="help-modal" onClick={e=>e.stopPropagation()}><h2 id="help-title">Petualangan & progres</h2><p>Ketiga karakter dapat mengikuti semua subtes. Pilih karakter, lalu jelajahi kampus dengan WASD, tombol panah, atau kontrol sentuh.</p><p>Dekati pintu atau station lalu tekan E/Space. Station menyediakan 10 soal latihan; Guru Utama menyediakan 20 soal campuran.</p><p>Karakter, posisi, jawaban sesi, poin dan riwayat disimpan otomatis. Timer ujian tetap berjalan saat halaman ditutup; saat kembali setelah waktu habis, hasil diselesaikan otomatis.</p><p>Jurnal menyimpan 100 sesi terakhir beserta soal salah dan kosong. Mode tamu tersimpan di browser ini. Mode akun tersimpan online setelah status penyimpanan berhasil.</p><button autoFocus className="primary" onClick={()=>setHelp(false)} onKeyDown={e=>{if(e.key==='Escape')setHelp(false);if(e.key==='Tab'){e.preventDefault();e.currentTarget.focus();}}}>Mengerti</button></section></div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<CloudGate><App/></CloudGate>);
