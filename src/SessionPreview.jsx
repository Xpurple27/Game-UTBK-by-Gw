import React,{useEffect,useRef,useState} from 'react';
import {useStore} from 'zustand';
import {gameStore} from './store';
import {characters} from './characters';
import {quizFor} from './questions';
const timeText=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
export default function SessionPreview({session:station,onClose}){
 const session=useStore(gameStore,s=>s.session),characterId=useStore(gameStore,s=>s.selectedCharacter);
 const character=characters.find(c=>c.id===characterId);
 const [confirm,setConfirm]=useState(null),[hintOpen,setHintOpen]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
 const dialog=useRef(null),title=useRef(null);
 const close=()=>{gameStore.getState().endSession();onClose();};
 useEffect(()=>{const previous=document.activeElement;title.current?.focus();return()=>previous?.focus?.();},[]);
 useEffect(()=>{title.current?.focus();setConfirm(null);setHintOpen(false);},[session?.status]);
 useEffect(()=>{
  if(session?.status!=='active')return;
  const tick=()=>gameStore.getState().tick();tick();const timer=setInterval(tick,250);
  document.addEventListener('visibilitychange',tick);window.addEventListener('focus',tick);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);window.removeEventListener('focus',tick);};
 },[session?.status]);
 const onKeyDown=e=>{
  e.stopPropagation();
  if(e.key==='Escape'){e.preventDefault();if(hintOpen)setHintOpen(false);else if(confirm)setConfirm(null);else if(session?.status==='active')setConfirm('leave');else close();}
  if(e.key==='Tab'){
   const scope=dialog.current.querySelector('.quiz-confirm')??dialog.current;
   const nodes=[...scope.querySelectorAll('button:not(:disabled),summary,[href],input:not(:disabled),[tabindex="0"]')].filter(n=>!n.closest('[inert]'));
   const first=nodes[0],last=nodes.at(-1);if(!first){e.preventDefault();return;}
   if(e.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement))){e.preventDefault();first.focus();}
  }
 };
 const start=()=>{if(!gameStore.getState().startQuiz(station))setError('Sesi belum dapat dimulai. Tutup panel ini, lalu coba lagi.');};
 const useSkill=()=>{const ok=gameStore.getState().useSkill();if(!ok)return;if(characterId==='analyst')setHintOpen(true);setNotice(characterId==='mage'?'+30 detik ditambahkan.':characterId==='hacker'?'Dua opsi salah dihilangkan. Pilihan yang tereliminasi dikosongkan.':'Petunjuk dibuka tanpa potongan poin.');};
 const move=index=>{setHintOpen(false);setNotice('');gameStore.getState().goTo(index);};
 const q=session?.questions[session.index],result=session?.result;
 const answered=session?Object.keys(session.answers).length:0;
 return <div className="backdrop quiz-backdrop"><section ref={dialog} className={'quiz-modal '+(!session?'intro-modal':'')} role="dialog" aria-modal="true" aria-labelledby="quiz-title" onKeyDown={onKeyDown}>
 {!session?<>
  <div className="eyebrow">{station.room.toUpperCase()} · {station.kind==='boss'?'GURU UTAMA':'STATION LATIHAN'}</div><div className="station-emblem">{station.kind==='boss'?'✦':'⌘'}</div>
  <h2 ref={title} tabIndex={-1} id="quiz-title">{station.title}</h2><p className="quiz-description">{station.description}</p>
  <div className="session-facts"><div><strong>{station.count}</strong><small>SOAL</small></div><div><strong>{quizFor(station).duration/60} menit</strong><small>WAKTU</small></div><div><strong>1×</strong><small>SKILL</small></div></div>
  <div className="quiz-rules"><p><b>+100 poin</b> dan <b>+5 koin</b> per jawaban benar. Salah atau kosong: 0 poin.</p><p>{character.name}: {character.effect} {character.passive}</p><p>Timer terus berjalan saat pindah tab. Waktu habis akan mengakhiri sesi otomatis. Jawaban tersimpan otomatis di browser ini. Memuat ulang halaman tidak mengulang timer.</p><small>Soal latihan orisinal. Poin game bukan skor resmi UTBK atau hasil IRT.</small></div>
  {error&&<p role="alert">{error}</p>}<div className="quiz-actions"><button className="secondary" onClick={close}>Kembali</button><button className="primary" onClick={start}>Mulai tantangan →</button></div>
 </>:session.status==='finished'?<>
  <div className="result-top"><div><div className="eyebrow">SESI SELESAI</div><h2 ref={title} tabIndex={-1} id="quiz-title">{result.reason==='timeout'?'Waktu habis. Tetap bertumbuh.':'Satu langkah lebih maju.'}</h2><p>{session.title} · {timeText(result.elapsed)} durasi sesi</p></div><div className="result-score">{result.accuracy}%<small>AKURASI</small></div></div>
  <div className="result-stats"><div><strong>{result.correct}</strong><small>BENAR</small></div><div><strong>{result.wrong}</strong><small>SALAH</small></div><div><strong>{result.unanswered}</strong><small>KOSONG</small></div><div><strong>+{result.earnedCoins}</strong><small>KOIN</small></div></div>
  <div className="earned"><span>✦ +{result.earnedScore} poin game</span><small>{result.baseScore} poin jawaban + {result.bonus} bonus PK</small></div>
  <div className="subject-results">{result.breakdown.map(b=><div key={b.subtest}><b>{b.subtest}</b><span>{b.correct}/{b.total} benar</span><progress max={b.total} value={b.correct}/></div>)}</div>
  <p className="result-disclaimer">Akurasi = jawaban benar ÷ seluruh soal. Hasil ini untuk latihan, bukan skor resmi UTBK. Menyelesaikan sesi belum berarti menguasai subtes.</p>
  <h3 className="review-title">Kunci & pembahasan <span>{result.total} soal</span></h3>
  <div className="review-list">{result.rows.map((row,i)=><details key={row.question.id}><summary><span className={row.correct?'correct':'incorrect'}>{row.correct?'✓':row.answer?'×':'–'}</span> Soal {i+1} · {row.question.subtest}<span>{row.correct?'Benar':row.answer?'Salah':'Kosong'}</span></summary><div className="review-content"><p>{row.question.text}</p><p>Jawabanmu: <b>{row.answer?`${row.answer}. ${row.question.options.find(o=>o.id===row.answer).text}`:'Belum dijawab'}</b></p><p className="correct">Kunci: <b>{row.question.correctOptionId}. {row.question.options.find(o=>o.id===row.question.correctOptionId).text}</b></p><p>{row.question.explanation}</p></div></details>)}</div>
  <div className="quiz-actions"><button className="primary" onClick={close}>Kembali ke akademi →</button></div>
 </>:<>
  <div className="quiz-top"><div><div className="eyebrow">{session.mode==='boss'?'BOSS CHALLENGE':'GUIDED CHALLENGE'}</div><h2 ref={title} tabIndex={-1} id="quiz-title">{session.title}</h2></div><div role="timer" aria-label={`Sisa waktu ${session.remaining} detik`} className={'quiz-timer '+(session.remaining<=60?'urgent':'')}>◷ {timeText(session.remaining)}</div></div>
  <div className="quiz-progress"><span>Soal <b>{session.index+1}</b> / {session.questions.length}</span><span>{answered} terjawab · {session.flags.length} ragu-ragu</span></div><progress className="answer-progress" value={answered} max={session.questions.length}/>
  <div className="quiz-layout"><div className="question-area"><div className="question-meta"><span>{q.subtest}</span>{characterId==='analyst'&&<span className="difficulty">{q.difficulty}</span>}<button className={session.flags.includes(q.id)?'flag flagged':'flag'} onClick={()=>gameStore.getState().toggleFlag()}>{session.flags.includes(q.id)?'⚑ Ditandai':'⚐ Ragu-ragu'}</button></div>
  <p className="question-text">{q.text}</p><div className="answer-options">{q.options.map(o=>{const eliminated=session.hiddenOptions[q.id]?.includes(o.id),selected=session.answers[q.id]===o.id;return <button key={o.id} aria-pressed={selected} disabled={eliminated} className={'answer-option '+(selected?'chosen ':'')+(eliminated?'eliminated':'')} onClick={()=>gameStore.getState().answer(o.id)}><span className="option-letter">{o.id}</span><span>{eliminated?'Opsi dieliminasi':o.text}</span>{selected&&<b>✓</b>}</button>;})}</div>
  <div className="skill-panel"><div><small>{character.name}</small><strong>{character.skill}</strong></div><button className="skill-button" disabled={session.skillUsed} onClick={useSkill}>{session.skillUsed?'✓ Skill terpakai':'✦ Gunakan Skill Karakter'}</button></div>
  {session.hints[q.id]&&<button className="hint-link" onClick={()=>setHintOpen(true)}>◇ Baca petunjuk lagi</button>}<p className="skill-feedback" role="status">{notice}</p>
  <div className="question-nav"><button className="secondary" disabled={session.index===0} onClick={()=>move(session.index-1)}>← Sebelumnya</button>{session.index<session.questions.length-1?<button className="primary" onClick={()=>move(session.index+1)}>Berikutnya →</button>:<button className="primary" onClick={()=>setConfirm('finish')}>Selesaikan sesi ✓</button>}</div></div>
  <aside className="question-sidebar"><h3>Navigasi soal</h3><div className="number-grid">{session.questions.map((item,i)=><button key={item.id} aria-label={`Soal ${i+1}${session.answers[item.id]?', terjawab':''}${session.flags.includes(item.id)?', ragu-ragu':''}`} aria-current={session.index===i?'step':undefined} className={(session.answers[item.id]?'answered ':'')+(session.flags.includes(item.id)?'marked ':'')+(session.index===i?'current':'')} onClick={()=>move(i)}>{i+1}{session.flags.includes(item.id)&&<sup>•</sup>}</button>)}</div><div className="number-legend"><span>● Terjawab</span><span>● Ragu-ragu</span><span>○ Belum dijawab</span></div><button className="secondary submit-session" onClick={()=>setConfirm('finish')}>Selesaikan sesi</button><button className="leave-session" onClick={()=>setConfirm('leave')}>Keluar tanpa menyimpan</button><p>Waktu terus berjalan selama sesi, termasuk saat panel konfirmasi terbuka.</p></aside></div>
 </>}
 {session?.status==='active'&&hintOpen&&<div className="quiz-cover"><div className="quiz-confirm" role="alertdialog" aria-label="Petunjuk soal"><div className="eyebrow">CLUE REVEAL</div><h3>Petunjuk soal {session.index+1}</h3><p>{session.hints[q.id]}</p><button autoFocus className="primary" onClick={()=>setHintOpen(false)}>Kembali ke soal</button></div></div>}
 {session?.status==='active'&&confirm&&<div className="quiz-cover"><div className="quiz-confirm" role="alertdialog" aria-label={confirm==='finish'?'Konfirmasi selesai':'Konfirmasi keluar'}><h3>{confirm==='finish'?'Selesaikan sesi sekarang?':'Keluar dari sesi?'}</h3><p>{confirm==='finish'?`${answered} dari ${session.questions.length} soal terjawab. ${session.questions.length-answered} soal kosong bernilai 0. ${session.flags.length} soal ditandai ragu-ragu.`:'Jawaban sesi ini akan dibuang. Poin, koin, dan status penyelesaian tidak bertambah.'}</p><small>Timer tetap berjalan.</small><div className="quiz-actions"><button autoFocus className="secondary" onClick={()=>setConfirm(null)}>Kembali ke soal</button><button className="primary" onClick={()=>confirm==='finish'?gameStore.getState().finishSession():close()}>{confirm==='finish'?'Ya, selesaikan':'Ya, keluar'}</button></div></div></div>}
 </section></div>;
}
