// Radial dead zone prevents accidental drift; cap diagonal speed at one.
export function joystickVector(dx,dy,radius=40,deadZone=.12){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(radius)||radius<=0)return {x:0,y:0,knobX:0,knobY:0};
 const distance=Math.hypot(dx,dy),fraction=Math.min(1,distance/radius);
 if(!distance)return {x:0,y:0,knobX:0,knobY:0};
 const strength=fraction<=deadZone?0:(fraction-deadZone)/(1-deadZone);
 return {x:strength?dx/distance*strength:0,y:strength?dy/distance*strength:0,knobX:dx/distance*fraction*radius,knobY:dy/distance*fraction*radius};
}
