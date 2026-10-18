// Latest outcome is a review aid, not a mastery score. Keep wrong and empty answers distinguishable.
export function reviewItems(history){
 const items=new Map();
 for(const entry of [...history].reverse())for(const row of entry.result.rows){
  const prior=items.get(row.question.id);
  if(!row.correct){items.set(row.question.id,{question:row.question,answer:row.answer,count:(prior?.count??0)+1,lastMissedAt:entry.finishedAt,lastSeenAt:entry.finishedAt,latestCorrect:false,latestAssisted:false,wasEmpty:row.answer===null});}
  else if(prior){items.set(row.question.id,{...prior,lastSeenAt:entry.finishedAt,latestCorrect:true,latestAssisted:entry.skillUsed&&entry.skillQuestionId===row.question.id});}
 }
 return [...items.values()].sort((a,b)=>b.lastMissedAt-a.lastMissedAt);
}
