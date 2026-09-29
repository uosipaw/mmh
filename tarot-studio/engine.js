import { existingGuide } from './guide-content.js';
// Original draft editorial content. No AI services are used at runtime.
const majorRows = [
  ['The Fool','Beginnings, curiosity, openness','Take a small step into something unfamiliar.','Check your footing before committing.'],
  ['The Magician','Agency, skill, intention','Use the resources already within reach.','Notice where intention and action have drifted apart.'],
  ['The High Priestess','Intuition, quiet, mystery','Leave room to listen before deciding.','Separate an inner signal from a fear or assumption.'],
  ['The Empress','Nurture, creativity, abundance','Give an idea or relationship practical care.','Consider where giving has depleted your own reserves.'],
  ['The Emperor','Structure, boundaries, leadership','Create a boundary that supports steady progress.','Ask whether structure has become control.'],
  ['The Hierophant','Tradition, learning, belonging','Seek a useful lesson from a trusted tradition.','Reconsider a rule that no longer fits your values.'],
  ['The Lovers','Values, connection, choice','Choose in alignment with your values.','Name the tension between what you want and what you agree to.'],
  ['The Chariot','Direction, resolve, momentum','Focus your effort on a clear destination.','Slow down and choose your direction again.'],
  ['Strength','Courage, patience, compassion','Meet a difficult feeling with steady kindness.','Rest before mistaking exhaustion for weakness.'],
  ['The Hermit','Solitude, reflection, insight','Make quiet space for your own judgment.','Notice whether solitude has become avoidance.'],
  ['Wheel of Fortune','Cycles, change, timing','Adapt to a changing situation.','Focus on your response to what you cannot control.'],
  ['Justice','Fairness, accountability, clarity','Consider the evidence and your responsibilities.','Examine a bias or an imbalance honestly.'],
  ['The Hanged Man','Pause, perspective, surrender','Try another viewpoint before pushing forward.','Ask what a prolonged pause is protecting you from.'],
  ['Death','Endings, transition, renewal','Make room by releasing what has run its course.','Acknowledge what you may be resisting letting go.'],
  ['Temperance','Balance, integration, moderation','Find a sustainable pace between extremes.','Restore a rhythm that has fallen out of balance.'],
  ['The Devil','Attachment, compulsion, limits','Name a pattern that reduces your sense of choice.','Look for one manageable step toward freedom.'],
  ['The Tower','Disruption, revelation, rebuilding','Notice what a disruption reveals about your foundations.','Consider whether avoiding change prolongs instability.'],
  ['The Star','Hope, renewal, trust','Nurture a modest source of hope.','Give yourself room to recover without forcing optimism.'],
  ['The Moon','Uncertainty, imagination, instinct','Allow uncertainty and check your assumptions.','Seek clarity without demanding an instant answer.'],
  ['The Sun','Vitality, joy, openness','Notice what brings uncomplicated energy and warmth.','Make space for small joys even when confidence is low.'],
  ['Judgement','Review, awakening, response','Review the past with honesty and self-compassion.','Distinguish useful accountability from harsh self-judgment.'],
  ['The World','Completion, integration, wholeness','Recognize a cycle completed and what it taught you.','Identify what needs closure before the next chapter.']
];
const suitRows = [
  ['Wands','creativity, initiative, and energy','✦'],
  ['Cups','feelings, connection, and care','♡'],
  ['Swords','thought, communication, and conflict','◇'],
  ['Pentacles','work, resources, and daily routines','○']
];
const rankRows = [
  ['Ace','A beginning','Notice a fresh opening','Consider what would help an unrealized beginning'],
  ['Two','A choice','Consider balance and partnership','Notice indecision or an uneven exchange'],
  ['Three','Growth','Explore what collaboration can develop','Check whether your efforts have enough support'],
  ['Four','Stability','Consider the role of rest and structure','Notice where stability may have become stagnation'],
  ['Five','Friction','Name a challenge without making it your whole story','Look for a small route toward repair'],
  ['Six','Adjustment','Notice an opportunity for reciprocity or recovery','Reconsider an old pattern that keeps resurfacing'],
  ['Seven','Assessment','Review your options and protect what matters','Question whether your current strategy still serves you'],
  ['Eight','Movement','Focus your effort and practice deliberately','Notice what is scattered, rushed, or stuck'],
  ['Nine','Maturity','Recognize what experience has taught you','Check the cost of carrying everything alone'],
  ['Ten','A culmination','Review the responsibilities and results you have gathered','Consider what can be released or shared'],
  ['Page','Curiosity','Approach the situation as a learner','Turn an idea into one small practice'],
  ['Knight','Action','Explore how you pursue what matters','Check your pace before charging ahead'],
  ['Queen','Stewardship','Bring receptive attention and mature care','Include your own needs in your care'],
  ['King','Direction','Lead with responsibility and perspective','Examine rigidity or a need to control']
];
export const cards = [
  ...majorRows.map(([name,keywords,upright,reversed], i) => ({id:`major-${i}`,name,keywords,upright,reversed,suit:'Major Arcana',symbol:'✧'})),
  ...suitRows.flatMap(([suit,domain,symbol]) => rankRows.map(([rank,theme,u,r], i) => ({
    id:`${suit.toLowerCase()}-${i+1}`,name:`${rank} of ${suit}`,suit,symbol,
    keywords:`${theme} · ${domain}`,upright:`${u} in ${domain}.`,reversed:`${r} in ${domain}.`
  })))
];
export const presets = [
  {id:'timeline',name:'Past · Present · Future',positions:['Past influences','Present circumstances','Possible direction']},
  {id:'decision',name:'A choice to make',positions:['What matters','Option A','Option B','A helpful next step']},
  {id:'creative',name:'Creative unblock',positions:['The spark','The block','What nourishes it']},
  {id:'connection',name:'Relationship reflection',positions:['My perspective','What I may be missing','A conversation to have']},
  {id:'release',name:'Release & welcome',positions:['What to release','What to welcome','My next step']},
  {id:'cross',name:'Celtic Cross',positions:['Present','Challenge','Foundation','Recent past','Conscious focus','Possible near future','My approach','Environment','Hopes and fears','Possible outcome']}
];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function draw(count, reversals = true, random = Math.random) {
  if (!Number.isInteger(count) || count < 1 || count > cards.length) throw new Error('Choose 1–78 cards.');
  const pool = cards.map(c=>c.id);
  for(let i=pool.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,count).map(id=>({id,reversed:reversals && random()<0.5}));
}
export function meaning(pull) {
  const card = cards.find(c=>c.id===pull.id);
  if(!card) throw new Error('Unknown card');
  return pull.reversed ? card.reversed : card.upright;
}
export function makeReading(spread, deck, reversals, question='') {
  return {id:`${Date.now()}-${Math.random().toString(36).slice(2,10)}`,date:new Date().toISOString(),spread:spread.name,positions:[...spread.positions],cards:draw(spread.positions.length,reversals),deck,question,notes:''};
}
export function shareText(reading) {
  // Private question and journal notes deliberately excluded.
  return [reading.spread,...reading.cards.map((p,i)=>`${reading.positions[i]}: ${cards.find(c=>c.id===p.id).name}${p.reversed?' (reversed)':''}`)].join('\n');
}
export function compare(a,b) {
  const common=a.cards.filter(p=>b.cards.some(q=>q.id===p.id)).map(p=>cards.find(c=>c.id===p.id).name);
  const suits=r=>r.cards.reduce((out,p)=>{const s=cards.find(c=>c.id===p.id).suit;out[s]=(out[s]||0)+1;return out;},{});
  return {common,suitsA:suits(a),suitsB:suits(b),samePositions:JSON.stringify(a.positions)===JSON.stringify(b.positions)};
}

// Preserve stable app IDs while using the existing site's full written guide.
const normalizeName = name => name.toLowerCase().replace('judgement','judgment');
for (const card of cards) {
  const entry = existingGuide.find(item => normalizeName(item.name) === normalizeName(card.name));
  if (!entry) throw new Error(`Missing existing guide entry: ${card.name}`);
  card.legacyId = entry.id;
  card.upright = entry.description.upright;
  card.reversed = entry.description.reversed;
  card.keywords = entry.keywords.join(' · ');
}
