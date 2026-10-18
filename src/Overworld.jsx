import React,{useEffect,useRef,useState} from 'react';
import Phaser from 'phaser';
import {useStore} from 'zustand';
import {gameStore} from './store';
import {characters} from './characters';
import {makeScholar} from './sprites';
import {WORLD,buildings,trees,obstacles,movementVector,zoneAt} from './world';
import {ROOM,roomObstacles,doors,roomTargets,nearestTarget,outsideSpawn,sessionPreview} from './interactions';
import {drawInterior} from './interior';
import SessionPreview from './SessionPreview';
import PlayerProfile from './PlayerProfile';
import CampusMap from './CampusMap';
import Joystick from './Joystick';
import SaveStatus from './SaveStatus';
import LearningJournal from './LearningJournal';

export default function Overworld({onExit}){
 const [profileOpen,setProfileOpen]=useState(false);
 const profile=useStore(gameStore,s=>s.profile);
 const [mapOpen,setMapOpen]=useState(false),[destination,setDestination]=useState(null);
 const location=useStore(gameStore,s=>s.location);
 const target=buildings.find(b=>b.id===destination);
 const bearing=target?Math.atan2(target.y+target.h+45-location.y,target.x+target.w/2-location.x)*180/Math.PI+90:0;
 const closeMap=()=>{setMapOpen(false);modalRef.current=false;resetRef.current();};
 const resumed=gameStore.getState().session;
 const [journalOpen,setJournalOpen]=useState(false);
 const checkpointRef=useRef(()=>{});
 const host=useRef(null),input=useRef({x:0,y:0}),joystick=useRef(null);
 const [zone,setZone]=useState('HALAMAN AKADEMI');
 const [paused,setPaused]=useState(false),[ready,setReady]=useState(false);
 const pauseRef=useRef(false),modalRef=useRef(!!resumed),interactRef=useRef(()=>{}),resetRef=useRef(()=>{});
 const [nearby,setNearby]=useState(null),[sessionInfo,setSessionInfo]=useState(()=>{if(!resumed)return null;const [kind,room]=resumed.id.split(':');return sessionPreview(roomTargets(room).find(t=>t.kind===kind));}),[roomName,setRoomName]=useState(null);
 const openJournal=()=>{checkpointRef.current();modalRef.current=true;resetRef.current();setJournalOpen(true);};
 const closeJournal=()=>{modalRef.current=false;setJournalOpen(false);resetRef.current();};
 const closeSession=()=>{modalRef.current=false;setSessionInfo(null);resetRef.current();};
 const totalScore=useStore(gameStore,s=>s.score),totalCoins=useStore(gameStore,s=>s.coins);
 const id=gameStore.getState().selectedCharacter;
 const character=characters.find(c=>c.id===id);
 const clearInput=()=>{input.current={x:0,y:0};joystick.current?.reset();};
 useEffect(()=>{
  let alive=true;
  let firstLaunch=true;const savedLocation=gameStore.getState().location;
  const speed=gameStore.getState().getPassive().speedMultiplier;
  class Campus extends Phaser.Scene{
   constructor(key="Campus"){super({key});}
   init(data={}){this.spawn=data.spawn??(firstLaunch?savedLocation:WORLD.spawn);this.resumeRoom=firstLaunch?savedLocation.room:null;firstLaunch=false;this.room=null;}
   create(){
    if(this.resumeRoom){this.scene.start('Interior',{room:this.resumeRoom,spawn:this.spawn});return;}
    this.physics.world.setBounds(32,32,WORLD.width-64,WORLD.height-64);
    const g=this.add.graphics();
    const rect=(x,y,w,h,color)=>g.fillStyle(color).fillRect(x,y,w,h);
    rect(0,0,WORLD.width,WORLD.height,0x273f3b);
    for(let y=0;y<WORLD.height;y+=32)for(let x=0;x<WORLD.width;x+=32){
     rect(x,y,32,32,((x/32+y/32)%3===0)?0x2b4440:0x29413c);
     if((x*7+y*11)%160===0){rect(x+7,y+12,2,5,0x426052);rect(x+11,y+9,2,7,0x365546);}
    }
    // Continuous paths join every entrance and the central courtyard.
    rect(662,330,116,680,0x8c8976);rect(240,470,960,90,0x8c8976);
    rect(240,440,80,80,0x8c8976);rect(1120,440,80,80,0x8c8976);
    rect(580,510,280,210,0x96917d);
    for(let y=340;y<1000;y+=32)for(let x=674;x<770;x+=32)rect(x,y,27,27,0x999580);
    for(let x=245;x<1200;x+=32){rect(x,481,27,29,0xa09a84);rect(x,516,27,28,0x98927d);}
    for(let x=32;x<WORLD.width-32;x+=32){rect(x,40,24,9,0x52665a);rect(x,1024,24,9,0x52665a);}
    for(let y=40;y<1030;y+=32){rect(32,y,9,24,0x52665a);rect(1399,y,9,24,0x52665a);}
    const label=(x,y,text,size=12,color='#e9e1ca')=>this.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,align:'center',stroke:'#182a2c',strokeThickness:3}).setOrigin(.5);
    buildings.forEach(b=>{
     rect(b.x+10,b.y+16,b.w,b.h,0x1b302e);
     rect(b.x,b.y,b.w,b.h,0x56696a);rect(b.x+8,b.y+10,b.w-16,b.h-18,0x82948b);
     rect(b.x-10,b.y-10,b.w+20,64,b.id==='pk'?0x3d6963:b.id==='pm'?0x5e5979:0x796746);
     for(let x=b.x;x<b.x+b.w;x+=32)rect(x,b.y-7,27,50,b.id==='pk'?0x4c7c72:b.id==='pm'?0x726b8c:0x8c7955);
     rect(b.x-16,b.y+48,b.w+32,12,0x263c3e);
     if(b.id==='pk'){
      for(let i=0;i<3;i++){rect(b.x+29+i*88,b.y+82,62,54,0x273e48);rect(b.x+34+i*88,b.y+87,52,40,0x82c8bd);rect(b.x+59+i*88,b.y+85,4,48,0x355553);}
      rect(b.x+235,b.y-57,7,47,0x91b0aa);rect(b.x+222,b.y-50,33,5,b.color);
     }else if(b.id==='pm'){
      for(let i=0;i<4;i++){rect(b.x+24+i*75,b.y+73,19,130,0xb2b6a2);rect(b.x+19+i*75,b.y+69,29,9,0xc9c8b1);}
      label(b.x+150,b.y+104,'✦',30,'#e6d5ff');
     }else{
      g.fillStyle(0x4a646e).fillEllipse(b.x+150,b.y-12,160,110);g.fillStyle(0x718d95).fillEllipse(b.x+150,b.y-20,138,86);
      rect(b.x+145,b.y-65,10,95,0x34505d);rect(b.x+190,b.y-51,74,16,0xb9b69a);rect(b.x+252,b.y-55,10,24,0xe0c887);
      for(let i=0;i<2;i++){rect(b.x+35+i*190,b.y+92,40,45,0x2b4350);rect(b.x+40+i*190,b.y+98,30,32,0xcfb878);}
     }
     rect(b.x+b.w/2-25,b.y+b.h-70,50,70,0x26393b);rect(b.x+b.w/2-17,b.y+b.h-62,34,62,0x455a58);
     rect(b.x+b.w/2+8,b.y+b.h-31,4,4,b.color);
     rect(b.x+b.w/2-34,b.y+b.h,68,9,0xb3ad91);
     label(b.x+b.w/2,b.y+b.h+28,b.name,13);
     label(b.x+b.w/2,b.y+b.h+48,'DEKATI PINTU · E / SPACE',9,'#a4b3ac');
    });
    // Fountain with a solid basin; shimmering water stays decorative.
    rect(650,545,140,112,0x4a625c);rect(658,553,124,96,0xb5ad92);rect(666,561,108,80,0x4e858b);
    rect(708,571,24,52,0xc5bea5);rect(695,563,50,14,0xd4cbb0);
    const water=this.add.rectangle(720,606,63,5,0x9fdbda,.6);this.tweens.add({targets:water,alpha:.2,duration:1700,yoyo:true,repeat:-1});
    trees.forEach(([x,y])=>{const t=this.add.graphics().setDepth(y+16);t.fillStyle(0x172d2a,.5).fillEllipse(x+4,y+9,60,24);t.fillStyle(0x735e42).fillRect(x-7,y-31,14,45);t.fillStyle(0x1c3931).fillRect(x-31,y-70,62,43);t.fillStyle(0x42664b).fillRect(x-25,y-84,50,49);t.fillStyle(0x577a54).fillRect(x-17,y-91,34,28);t.fillStyle(0x749461).fillRect(x-11,y-86,16,8);});
    [430,910].forEach(x=>{rect(x,730,100,10,0x9a8156);rect(x,744,100,9,0xb59a68);rect(x+8,751,7,10,0x36443b);rect(x+85,751,7,10,0x36443b);});
    [200,1110].forEach(x=>{rect(x,580,130,52,0x576f54);for(let n=0;n<10;n++){rect(x+8+n*12,588+(n%3)*10,5,5,n%2?0xdbb375:0xae8ea5);}});
    label(720,830,'THE SCHOLAR’S GUILD',17);label(720,852,'Berjalanlah menuju gedung pilihanmu',10,'#a4bcb0');
    label(720,1000,'GERBANG AKADEMI',11,'#cfc8ac');
    this.setupPlayer(WORLD,obstacles,doors);
   }
   setupPlayer(bounds,solidObjects,targets){
    this.physics.world.setBounds(48,64,bounds.width-96,bounds.height-112);
    const walls=this.physics.add.staticGroup();
    solidObjects.forEach(o=>{const body=this.add.zone(o.x+o.w/2,o.y+o.h/2,o.w,o.h);this.physics.add.existing(body,true);walls.add(body);});
    if(!this.textures.exists('player'))this.textures.addCanvas('player',makeScholar(id));
    this.player=this.physics.add.sprite(this.spawn.x,this.spawn.y,'player').setScale(1.7);
    this.player.body.setSize(14,10).setOffset(9,21);this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player,walls);
    this.nameLabel=this.add.text(this.player.x,this.player.y-38,gameStore.getState().profile?.displayName??'Petualang',{fontFamily:'system-ui',fontSize:'14px',color:'#ffffff',backgroundColor:'#172f2c',padding:{x:6,y:3}}).setOrigin(.5).setDepth(10000);
    this.shadow=this.add.ellipse(this.player.x,this.player.y+22,32,10,0x142826,.6);
    this.cameras.main.setBounds(0,0,bounds.width,bounds.height).startFollow(this.player,true,.12,.12);
    const fitCamera=()=>{const width=this.scale.width;this.cameras.main.setZoom(width<620?.68:width<1025?.85:1);};fitCamera();this.scale.on('resize',fitCamera);this.events.once('shutdown',()=>this.scale.off('resize',fitCamera));
    this.cameras.main.setBackgroundColor('#182d34');this.cameras.main.fadeIn(220);
    this.keys=this.input.keyboard.addKeys({up:'W',down:'S',left:'A',right:'D',up2:'UP',down2:'DOWN',left2:'LEFT',right2:'RIGHT'});
    this.input.keyboard.addCapture(['UP','DOWN','LEFT','RIGHT']);
    this.targets=targets;this.near=null;this.lastZone='';this.travel=0;this.transitioning=false;this.lastCheckpoint=0;
    const checkpoint=()=>{if(this.player?.active)gameStore.getState().saveLocation({room:this.room,x:this.player.x,y:this.player.y});};checkpointRef.current=checkpoint;checkpoint();
    this.halo=this.add.graphics().setDepth(1);
    const interact=()=>{
     if(pauseRef.current||modalRef.current||this.transitioning)return;
     const target=nearestTarget(this.targets,this.player.x,this.player.y+18);if(!target)return;
     clearInput();this.input.keyboard.resetKeys();this.player.setVelocity(0,0);
     if(target.kind==='door'||target.kind==='exit'){
      this.transitioning=true;setNearby(null);
      this.cameras.main.fadeOut(180);
      this.time.delayedCall(180,()=>this.scene.start(target.kind==='door'?'Interior':'Campus',target.kind==='door'?{room:target.room}:{spawn:outsideSpawn(target.room)}));
     }else{
      checkpoint();modalRef.current=true;resetRef.current();setSessionInfo(sessionPreview(target));
     }
    };
    const keyInteract=e=>{if((e.code==='KeyE'||(e.code==='Space'&&e.target?.tagName!=='BUTTON'))&&!e.repeat){e.preventDefault();interact();}};
    this.input.keyboard.on('keydown',keyInteract);interactRef.current=interact;
    resetRef.current=()=>{clearInput();this.input.keyboard?.resetKeys();if(this.input.keyboard){this.input.keyboard.enabled=!modalRef.current;this.input.keyboard[modalRef.current?'removeCapture':'addCapture'](['W','A','S','D','UP','DOWN','LEFT','RIGHT']);}this.player?.setVelocity(0,0);};
    this.events.once('shutdown',()=>{this.input.keyboard.off('keydown',keyInteract);interactRef.current=()=>{};resetRef.current=()=>{};checkpointRef.current=()=>{};});
    resetRef.current();
    if(alive){setReady(true);setNearby(null);setRoomName(this.room?buildings.find(b=>b.id===this.room).name:null);}
   }
   update(time,delta){
    if(!this.player)return;
    if(time-this.lastCheckpoint>=750&&!this.transitioning){checkpointRef.current();this.lastCheckpoint=time;}
    const k=this.keys,t=input.current;
    const x=Number(k.right.isDown||k.right2.isDown)-Number(k.left.isDown||k.left2.isDown);
    const y=Number(k.down.isDown||k.down2.isDown)-Number(k.up.isDown||k.up2.isDown);
    const v=(pauseRef.current||modalRef.current||this.transitioning)?{x:0,y:0}:(x||y?movementVector(x,y,speed):{x:t.x*WORLD.baseSpeed*speed,y:t.y*WORLD.baseSpeed*speed});
    this.player.setVelocity(v.x,v.y);if(v.x)this.player.setFlipX(v.x<0);
    this.travel+=(Math.abs(this.player.body.velocity.x)+Math.abs(this.player.body.velocity.y))*delta/1000;
    this.player.setAngle(v.x||v.y?Math.sin(this.travel*.12)*3:0);
    this.player.setDepth(this.player.y+25);this.nameLabel.setPosition(this.player.x,this.player.y-38).setText(gameStore.getState().profile?.displayName??'Petualang');this.shadow.setPosition(this.player.x,this.player.y+22).setDepth(this.player.depth-1);
    const near=nearestTarget(this.targets,this.player.x,this.player.y+18);
    if(near?.id!==this.near?.id){this.near=near;this.halo.clear();if(near){this.halo.lineStyle(2,0xe9d39c,.7).strokeEllipse(near.x,near.y,62,20);}if(alive)setNearby(near);}
    const next=this.room?buildings.find(b=>b.id===this.room).name:zoneAt(this.player.x,this.player.y);if(next!==this.lastZone){this.lastZone=next;if(alive)setZone(next);}
   }
  }
  class Interior extends Campus{
   constructor(){super('Interior');}
   init(data){this.room=data.room;this.spawn=data.spawn??ROOM.spawn;}
   create(){drawInterior(this,this.room);this.setupPlayer(ROOM,roomObstacles,roomTargets(this.room));}
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent:host.current,width:960,height:600,pixelArt:true,roundPixels:true,banner:false,audio:{noAudio:true},physics:{default:'arcade',arcade:{debug:false}},scale:{mode:Phaser.Scale.RESIZE,width:host.current.clientWidth,height:host.current.clientHeight},scene:[Campus,Interior]});
  const reset=()=>{clearInput();resetRef.current();};
  const blur=()=>{checkpointRef.current();reset();pauseRef.current=true;if(alive)setPaused(true);};
  const hidden=()=>{if(document.hidden)blur();};
  const saveBeforeHide=()=>checkpointRef.current();window.addEventListener('pagehide',saveBeforeHide);
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const resize=new ResizeObserver(()=>{if(host.current)game.scale.resize(host.current.clientWidth,host.current.clientHeight);});resize.observe(host.current);
  return()=>{checkpointRef.current();window.removeEventListener('pagehide',saveBeforeHide);alive=false;resize.disconnect();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);reset();game.destroy(true);};
 },[id]);
 const togglePause=()=>{resetRef.current();pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);};
 return <div className="world-page"><header className="world-header"><div className="brand"><span className="brand-icon">✦</span><span>UTBK <b>QUEST</b><small>THE SCHOLAR'S GUILD</small></span></div><button className="world-back" onClick={onExit}>← Menu utama</button></header><main className="world-main"><div className="world-title"><div><div className="eyebrow">CHAPTER 06 · YOUR IDENTITY</div><h1>{roomName??"Selamat datang di akademi."}</h1></div><button className="secondary" onClick={openJournal} disabled={!!sessionInfo}>▤ Jurnal belajar</button></div><div className="navigation-strip"><button className="secondary" disabled={!!sessionInfo||journalOpen||profileOpen} onClick={()=>{checkpointRef.current();modalRef.current=true;resetRef.current();setMapOpen(true);}}>⌖ Denah kampus</button>{target&&<span>{location.room?'Keluar gedung dahulu → ':<b style={{display:'inline-block',transform:`rotate(${bearing}deg)`}}>↑</b>} Tujuan: {target.id.toUpperCase()} <button aria-label="Hapus tujuan" onClick={()=>setDestination(null)}>×</button></span>}</div><div className="player-strip"><span>◉ {profile?.displayName??'Petualang'} <small>{gameStore.cloudMode?'Mode akun':'Mode tamu'}</small></span><button className="secondary" disabled={!!sessionInfo||journalOpen} onClick={()=>{checkpointRef.current();modalRef.current=true;resetRef.current();setProfileOpen(true);}}>Edit profil</button></div><SaveStatus/><div className="world-shell"><div className="world-toolbar"><div><span style={{color:character.color}}>●</span> {character.name}<small>{id==='mage'?'Kecepatan +15%':'Kecepatan normal'}</small></div><div className="world-values">◈ {totalCoins} koin <span>·</span> {totalScore} poin</div><button aria-label={paused?'Lanjutkan permainan':'Jeda permainan'} disabled={!!sessionInfo||journalOpen} onClick={togglePause}>{paused?'▶ Lanjut':'Ⅱ Jeda'}</button></div><div className="map-wrap"><div ref={host} className="game-canvas" role="application" aria-label="Peta kampus. Gunakan WASD atau tombol panah untuk bergerak. Dekati pintu atau station dan tekan E atau Space."/><div className="zone-label">⌖ {zone}</div><div className="compass" aria-hidden="true">N<br/>↑</div>{!ready&&<div className="map-overlay">Menyiapkan akademi…</div>}{paused&&<div className="map-overlay"><h2>Petualangan dijeda</h2><button className="primary" onClick={togglePause}>Lanjutkan eksplorasi →</button></div>}</div><div className="world-controls"><div className="control-copy"><strong>Jelajahi, kenali, bersiap.</strong><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> atau tombol panah untuk bergerak.</p><small><span className="keyboard-hint">Dekati pintu / station. Tekan E atau Space untuk berinteraksi.</span><span className="touch-hint">Geser joystick kiri. Ketuk tombol kanan saat dekat pintu atau station.</span></small></div><button className="interact-button" disabled={!nearby||paused||!!sessionInfo} onClick={()=>interactRef.current()}><kbd>E</kbd><span>{nearby?.label??"Dekati objek"}</span></button><Joystick ref={joystick} disabled={paused||!!sessionInfo||journalOpen||profileOpen||mapOpen||!ready} onChange={v=>{input.current=v;}}/></div></div><div className="building-guide">{characters.map(c=><div key={c.id}><span style={{color:c.color}}>{c.code}</span><p>{c.id==='hacker'?'Laboratorium teknologi':c.id==='mage'?'Perpustakaan agung':'Observatorium'}<small>{c.role.toLowerCase()}</small></p><b>BUKA</b></div>)}</div></main><footer><span>✦ THE SCHOLAR'S GUILD</span><span>Latih pikiran. Naikkan level. Raih tujuan.</span><span>MILESTONE 06B · CLOUD SAVE</span></footer>{mapOpen&&<CampusMap location={location} onClose={closeMap} onSelect={id=>{setDestination(id);closeMap();}}/>}{profileOpen&&<PlayerProfile onClose={()=>{setProfileOpen(false);modalRef.current=false;resetRef.current();}}/>}{journalOpen&&<LearningJournal onClose={closeJournal}/>} {sessionInfo&&<SessionPreview session={sessionInfo} onClose={closeSession}/>}</div>;
}
