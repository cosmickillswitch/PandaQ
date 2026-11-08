const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LOGICS={
  classical:{name:'Classical',note:'Every rule, including indirect proof (IP). Truth tables decide validity.'},
  intuitionistic:{name:'Intuitionistic',note:'No indirect proof. Ex falso (⊥E) is allowed. A proof must construct what it claims.'},
  minimal:{name:'Minimal',note:'Only introduction and elimination rules. ⊥ carries no special power.'}
};
const RULES=['∧I','∧E','∨I','∨E','→I','→E','¬I','¬E','↔I','↔E','R','⊥E','IP'];
const EXAMPLES=[
  ['Modus ponens','P → Q, P ⊢ Q'],
  ['Hypothetical syllogism','P → Q, Q → R ⊢ P → R'],
  ['Contraposition','P → Q ⊢ ¬Q → ¬P'],
  ['De Morgan (∨)','¬(P ∨ Q) ⊢ ¬P ∧ ¬Q'],
  ['De Morgan (∧)','¬(P ∧ Q) ⊢ ¬P ∨ ¬Q'],
  ['Disjunctive syllogism','P ∨ Q, ¬P ⊢ Q'],
  ['Distribution','P ∧ (Q ∨ R) ⊢ (P ∧ Q) ∨ (P ∧ R)'],
  ['↔ chain','P ↔ Q, Q ↔ R ⊢ P ↔ R'],
  ['Ex falso','P, ¬P ⊢ Q'],
  ['Excluded middle','⊢ P ∨ ¬P'],
  ['Double negation','¬¬P ⊢ P'],
  ['Peirce’s law','⊢ ((P → Q) → P) → P'],
  ['Affirming the consequent','P → Q, Q ⊢ P'],
];
let logic='classical',proof=null,step=1;

function setLogic(l){logic=l;
  document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.logic===l)));
  $('logicnote').textContent=LOGICS[l].note;
  $('rules').innerHTML=RULES.map(r=>{const off=(r==='⊥E'&&l==='minimal')||(r==='IP'&&l!=='classical');
    const sp=(r==='⊥E'&&l!=='minimal')||(r==='IP'&&l==='classical');
    return `<span class="rule${off?' off':''}${sp?' special':''}">${r}</span>`;}).join('');
}
const F=f=>`<span class="f">${esc(str(f))}</span>`;
const ruleLabel=r=>r==='X'?'⊥E':r;
function refText(refs){return refs.map(r=>Array.isArray(r)?(r[0]===r[1]?r[0]:r[0]+'–'+r[1]):r).join(', ');}

function explain(L,i,lines){
  const at=n=>lines[n-1].f, ln=n=>`line ${n}`, rng=r=>r[0]===r[1]?`line ${r[0]}`:`lines ${r[0]}–${r[1]}`;
  const R=L.refs;
  switch(L.rule){
    case'Premise':return`A premise. We are allowed to use ${F(L.f)} from the start.`;
    case'Assumption':{
      const T=L.target;
      switch(L.purpose){
        case'imp':return`Open a subproof by assuming ${F(L.f)}. If ${F(T)} follows inside it, →I will give the conditional.`;
        case'not':return`Assume ${F(L.f)} and aim for a contradiction (⊥). Reaching ⊥ lets ¬I conclude ${F({t:'not',a:L.f})}.`;
        case'iff1':return`First half of ↔I: assume ${F(L.f)} and show ${F(T)}.`;
        case'iff2':return`Second half of ↔I: now assume ${F(L.f)} and show ${F(T)}.`;
        case'case1':return`∨E, first case: suppose the left disjunct of ${F(at(L.disj))} (${ln(L.disj)}), ${F(L.f)}, and show ${F(T)}.`;
        case'case2':return`∨E, second case: suppose the right disjunct, ${F(L.f)}, and show ${F(T)} again.`;
        case'ip':return`Indirect proof: assume the opposite of what we want, ${F(L.f)}. If that leads to ⊥, IP gives ${F(L.f.a)}.`;
      }return'Assumption.';}
    case'∧E':return`∧ elimination. ${F(at(R[0]))} on ${ln(R[0])} is a conjunction, so its part ${F(L.f)} holds on its own.`;
    case'∧I':return`∧ introduction. We have ${F(at(R[0]))} (${ln(R[0])}) and ${F(at(R[1]))} (${ln(R[1])}), so we have both together.`;
    case'∨I':return`∨ introduction. ${F(at(R[0]))} holds (${ln(R[0])}), so any disjunction with it as one side holds too.`;
    case'∨E':return`∨ elimination. From ${F(at(R[0]))} (${ln(R[0])}), both cases (${rng(R[1])} and ${rng(R[2])}) reach ${F(L.f)}, so it holds either way. Both case assumptions are now closed.`;
    case'→I':return`→ introduction. Assuming ${F(at(R[0][0]))} led to ${F(at(R[0][1]))} (${rng(R[0])}), so we close the subproof and conclude ${F(L.f)}.`;
    case'→E':return`→ elimination (modus ponens). ${F(at(R[0]))} (${ln(R[0])}) and its antecedent ${F(at(R[1]))} (${ln(R[1])}) give ${F(L.f)}.`;
    case'↔I':return`↔ introduction. Each side was derived from the other (${rng(R[0])} and ${rng(R[1])}).`;
    case'↔E':return`↔ elimination. ${F(at(R[0]))} (${ln(R[0])}) and one side, ${F(at(R[1]))} (${ln(R[1])}), give the other side.`;
    case'¬I':return`¬ introduction. Assuming ${F(at(R[0][0]))} produced ⊥ (${rng(R[0])}), so the assumption must be false.`;
    case'¬E':return`¬ elimination. ${F(at(R[0]))} (${ln(R[0])}) and ${F(at(R[1]))} (${ln(R[1])}) contradict each other, which gives ⊥.`;
    case'X':return`Ex falso (⊥E). ⊥ on ${ln(R[0])} lets us infer anything, here ${F(L.f)}. Minimal logic does not have this rule.`;
    case'IP':return`Indirect proof. Assuming ${F(at(R[0][0]))} led to ⊥ (${rng(R[0])}), so ${F(L.f)}. This is the rule that makes the logic classical.`;
    case'R':return`Reiteration. Copy ${F(L.f)} from ${ln(R[0])} so this subproof can end on it.`;
  }return'';
}

function render(){
  const box=$('proof');
  if(!proof){box.innerHTML='';return;}
  const lines=proof.lines,n=lines.length,cur=lines[step-1];
  const refset=new Set();cur.refs.forEach(r=>{if(Array.isArray(r)){for(let k=r[0];k<=r[1];k++)refset.add(k);}else refset.add(r);});
  const lastPrem=lines.reduce((m,L,i)=>L.rule==='Premise'?i:m,-1);
  box.innerHTML=lines.map((L,i)=>{
    if(i>=step)return'';
    const bars='<span class="bar"></span>'.repeat(L.depth+1);
    const line=L.rule==='Assumption'||i===lastPrem;
    const cls='row'+(i===step-1?' cur':refset.has(i+1)?' isref':'');
    const just=L.rule==='Premise'?'Premise':L.rule==='Assumption'?'Assumption':ruleLabel(L.rule)+' '+refText(L.refs);
    return`<div class="${cls}"><span class="num">${i+1}</span><div class="fcell">${bars}<span class="ftxt${line?' line':''}"><span>${esc(str(L.f))}</span></span></div><span class="just">${esc(just)}</span></div>`;
  }).join('');
  $('slider').max=n;$('slider').value=step;
  $('counter').textContent=`line ${step} of ${n}`;
  $('first').disabled=$('prev').disabled=step<=1;
  $('next').disabled=$('all').disabled=step>=n;
  const title=cur.rule==='Premise'?'Premise':cur.rule==='Assumption'?'Assumption':ruleLabel(cur.rule);
  $('explain').innerHTML=`<div class="label">Line ${step}</div><h2>${esc(title)}</h2><p>${explain(cur,step-1,lines)}</p>`;
  const row=box.querySelector('.row.cur');if(row&&row.scrollIntoView&&document.activeElement&&document.activeElement.closest('.controls'))row.scrollIntoView({block:'nearest'});
}

function run(){
  const st=$('status'),sheet=$('sheet');
  let seq;
  try{seq=parseSequent($('seq').value);}catch(e){st.className='status bad';st.innerHTML=`<strong>Can’t read that.</strong> ${esc(e.message)}`;sheet.hidden=true;return;}
  const seqStr=(seq.premises.map(str).join(', ')+(seq.premises.length?' ':'')+'⊢ '+str(seq.goal));
  const res=proveSequent(seq.premises,seq.goal,logic);
  if(res.ok){
    proof=res;step=res.lines.length;sheet.hidden=false;
    $('seqshow').textContent=seqStr;$('sheetlogic').textContent=LOGICS[logic].name+' logic';
    st.className='status ok';st.innerHTML=`Proved in ${res.lines.length} lines with ${LOGICS[logic].name.toLowerCase()} rules. Press <b>Start</b> to walk through it.`;
    render();return;
  }
  proof=null;sheet.hidden=true;
  const cm=countermodel(seq.premises,seq.goal);
  st.className='status bad';
  if(cm){const v=Object.entries(cm).map(([a,b])=>`${a} = ${b?'T':'F'}`).join(', ');
    st.innerHTML=`<strong>Not valid.</strong> With <span class="f">${esc(v)}</span> every premise is true and the conclusion is false, so no logic here can prove it.`;}
  else if(logic!=='classical'&&cm===null){
    const which=logic==='minimal'?'minimal':'intuitionistic';
    st.innerHTML=`<strong>No ${which} proof found.</strong> The sequent is classically valid, but it seems to need ${logic==='minimal'?'ex falso or indirect proof':'indirect proof'} (like excluded middle or double-negation elimination). Try ${logic==='minimal'?'Intuitionistic or Classical':'Classical'}.`;}
  else st.innerHTML=`<strong>No proof found.</strong> ${res.gaveUp?'The search ran out of steps. ':''}Try breaking it into smaller lemmas.`;
}

document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{setLogic(b.dataset.logic);run();}));
$('go').addEventListener('click',run);
$('seq').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
$('keys').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const inp=$('seq');
  const s=inp.selectionStart??inp.value.length,t=inp.selectionEnd??s,k=b.dataset.k;
  inp.value=inp.value.slice(0,s)+k+inp.value.slice(t);inp.focus();inp.setSelectionRange(s+k.length,s+k.length);});
$('examples').innerHTML=EXAMPLES.map(([n,s],i)=>`<button data-i="${i}">${esc(n)}</button>`).join('');
$('examples').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('seq').value=EXAMPLES[b.dataset.i][1];run();});
$('first').addEventListener('click',()=>{step=1;render();});
$('prev').addEventListener('click',()=>{if(step>1){step--;render();}});
$('next').addEventListener('click',()=>{if(proof&&step<proof.lines.length){step++;render();}});
$('all').addEventListener('click',()=>{if(proof){step=proof.lines.length;render();}});
$('slider').addEventListener('input',e=>{step=+e.target.value;render();});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'&&e.target.type!=='range')return;
  if(e.key==='ArrowRight'&&proof&&step<proof.lines.length){step++;render();}
  if(e.key==='ArrowLeft'&&step>1){step--;render();}});
setLogic('classical');{const q=new URLSearchParams(location.search).get('seq');if(q)$('seq').value=q;}run();
