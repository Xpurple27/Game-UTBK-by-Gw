import React,{forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {joystickVector} from './joystick';
const Joystick=forwardRef(function Joystick({disabled,onChange},ref){
 const pad=useRef(null),pointer=useRef(null),callback=useRef(onChange),[knob,setKnob]=useState({x:0,y:0});callback.current=onChange;
 const reset=()=>{const id=pointer.current;pointer.current=null;callback.current({x:0,y:0});setKnob({x:0,y:0});if(id!==null&&pad.current?.hasPointerCapture(id))pad.current.releasePointerCapture(id);};
 useImperativeHandle(ref,()=>({reset}));
 useEffect(()=>{if(disabled)reset();},[disabled]);
 useEffect(()=>{const hidden=()=>{if(document.hidden)reset();};window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',hidden);return()=>{window.removeEventListener('blur',reset);window.removeEventListener('resize',reset);document.removeEventListener('visibilitychange',hidden);callback.current({x:0,y:0});};},[]);
 const move=e=>{if(disabled||pointer.current!==e.pointerId)return;e.preventDefault();const r=pad.current.getBoundingClientRect();const v=joystickVector(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,(r.width-52)/2);callback.current({x:v.x,y:v.y});setKnob({x:v.knobX,y:v.knobY});};
 const end=e=>{if(pointer.current===e.pointerId)reset();};
 return <div className="touch-joystick"><div ref={pad} className={'joystick-pad'+(disabled?' disabled':'')} role="group" aria-label="Joystick gerak. Geser dan tahan untuk berjalan; lepaskan untuk berhenti." aria-disabled={disabled} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(disabled||pointer.current!==null||e.button!==0)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}><span className="joystick-cross" aria-hidden="true">✧</span><span className="joystick-knob" style={{transform:`translate(${knob.x}px, ${knob.y}px)`}} aria-hidden="true"/></div><small>Geser untuk berjalan</small></div>;
});
export default Joystick;
