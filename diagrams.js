/* PandQ Diagrams: one formula, eight ways of drawing it.
   Needs fitch-core.js (parse, str, atoms, evalF, key). */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const INK='fill:var(--ink)',MUTED='fill:var(--muted)';
const FM='font-family:var(--f-formula)';
const svgOpen=(w,h,label)=>`<svg class="dg" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${esc(label)}">`;
const txt=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" dominant-baseline="${o.b||'central'}" style="${o.st||INK};${o.f||FM};font-size:${o.size||18}px${o.w?';font-weight:'+o.w:''}">${esc(s)}</text>`;
const line=(x1,y1,x2,y2,st='stroke:var(--ink)',w=2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="${st};stroke-width:${w};stroke-linecap:round"/>`;

/* ---------- formula state ---------- */
let F='P → Q', VIEW='hasse', VENN='literal', PHI=3.42, SPIN=false, BDDROT=0, PEIRCE_DC=false;
try{const s=JSON.parse(localStorage.getItem('pandq-diagrams')||'null');if(s){F=s.F||F;VIEW=s.VIEW||VIEW;VENN=s.VENN||VENN;}}catch(e){}
{const q=new URLSearchParams(location.search);if(q.get('f'))F=q.get('f');if(q.get('v'))VIEW=q.get('v');}
const save=()=>{try{localStorage.setItem('pandq-diagrams',JSON.stringify({F,VIEW,VENN}));}catch(e){}};

function analyse(){
  const ast=parse(F);
  const vars=[...atoms(ast)].sort();
  const n=vars.length;
  const rows=[];for(let i=0;i<(1<<n);i++){const v={};vars.forEach((x,j)=>v[x]=((i>>(n-1-j))&1)===0);rows.push(v);}
  return{ast,vars,n,rows,vals:rows.map(v=>evalF(ast,v))};
}
const TF=b=>b?'T':'F';
const caseName=(vars,v)=>vars.map(x=>TF(v[x])).join('');
const tooMany=(n,max,what)=>n>max?`<p class="dnote">${what} works with up to ${max} letters; this formula has ${n}.</p>`:'';

/* ---------- 1. Hasse diagram of the 16 binary connectives ---------- */
const CONN={'0000':['⊥','P ∧ ¬P','contradiction'],'1000':['∧','P ∧ Q','and'],'0100':['⊅','P ∧ ¬Q','but not (non-implication)'],'0010':['⊄','¬P ∧ Q','not…but (converse non-implication)'],'0001':['↓','¬(P ∨ Q)','neither…nor (NOR)'],
 '1100':['P','P','P'],'1010':['Q','Q','Q'],'1001':['↔','P ↔ Q','iff'],'0110':['⊕','¬(P ↔ Q)','exclusive or'],'0101':['¬Q','¬Q','not Q'],'0011':['¬P','¬P','not P'],
 '1110':['∨','P ∨ Q','or'],'1101':['←','Q → P','if (converse)'],'1011':['→','P → Q','if…then'],'0111':['↑','¬(P ∧ Q)','not both (NAND)'],'1111':['⊤','P ∨ ¬P','tautology']};
function hasseVec(a){
  const L=[a.vars[0]||'P',a.vars[1]||'Q'];
  if(a.n>2)return{L,bits:null};
  const bits=[[true,true],[true,false],[false,true],[false,false]].map(([p,q])=>{const v={};v[L[0]]=p;v[L[1]]=q;return evalF(a.ast,v)?'1':'0';}).join('');
  return{L,bits};
}
function hasseSVG(a){
  const {L,bits}=hasseVec(a);
  const W=380,H=590,cx=190,base=490,gap=88,r=110;
  const ang=[0,48,96,144].map(d=>d*Math.PI/180+PHI);
  const pos={};
  for(let m=0;m<16;m++){const b=[3,2,1,0].map(i=>(m>>i)&1);const k=b.join('');
    let x=0,z=0;b.forEach((s,i)=>{const sg=s?.5:-.5;x+=sg*r*Math.cos(ang[i]);z+=sg*r*Math.sin(ang[i]);});
    const rank=b.reduce((p,c)=>p+c,0);pos[k]={x:cx+x,y:base-rank*gap+z*.5,z,rank};}
  const keys=Object.keys(pos);
  const edges=[];keys.forEach(k=>{for(let i=0;i<4;i++)if(k[i]==='0'){const u=k.slice(0,i)+'1'+k.slice(i+1);edges.push([k,u]);}});
  edges.sort((e,f)=>(pos[e[0]].z+pos[e[1]].z)-(pos[f[0]].z+pos[f[1]].z));
  const sub=s=>s.replace(/P/g,'\u0001').replace(/Q/g,L[1]).replace(/\u0001/g,L[0]);
  let s=svgOpen(W,H,'Hasse diagram of the sixteen two-letter connectives');
  edges.forEach(([p,q])=>{const on=bits&&(p===bits||q===bits);s+=line(pos[p].x,pos[p].y,pos[q].x,pos[q].y,`stroke:${on?'var(--accent)':'var(--rule)'}`,on?3:2);});
  keys.sort((p,q)=>pos[p].z-pos[q].z).forEach(k=>{const p=pos[k],on=k===bits,c=CONN[k];
    const label=c[0]==='P'||c[0]==='Q'||c[0]==='¬P'||c[0]==='¬Q'?sub(c[0]):c[0];
    s+=`<g class="hn" data-f="${esc(sub(c[1]))}" tabindex="0" role="button" aria-label="${esc(c[2]+', '+k)}"><title>${esc(sub(c[1]))} · ${k} (${c[2]})</title>`+
      `<circle cx="${p.x}" cy="${p.y}" r="${on?22:19}" style="fill:${on?'var(--accent)':'var(--paper)'};stroke:${on?'var(--accent)':'var(--muted)'};stroke-width:2"/>`+
      txt(p.x,p.y,label,{st:on?'fill:var(--accent-ink)':INK,size:label.length>1?15:19,f:"font-family:'Noto Sans Math','STIX Two Text',serif"})+`</g>`;});
  s+=txt(8,H-12,'fewer cases true',{a:'start',size:11,f:'font-family:var(--f-body)',st:MUTED})+txt(8,14,'more cases true',{a:'start',size:11,f:'font-family:var(--f-body)',st:MUTED});
  return s+'</svg>';
}
function hasse(a){
  const {L,bits}=hasseVec(a);const s=hasseSVG(a);
  const sub=x=>x.replace(/P/g,'\u0001').replace(/Q/g,L[1]).replace(/\u0001/g,L[0]);
  const where=bits?`<p class="dnote">This formula is <strong>${esc(sub(CONN[bits][2]))}</strong>, pattern <code>${bits}</code> over the cases TT, TF, FT, FF.</p>`
    :`<p class="dnote">This formula has ${a.n} letters, so it isn’t one of the 16 two-letter connectives. Tap a node to load one.</p>`;
  return{title:'Hasse diagram of the connectives',
    lead:`Each of the 16 ways to combine ${L[0]} and ${L[1]} is a pattern of four truth values. Going up a line makes one more case true, so each connective entails every one you can reach by going up. Drag or use the slider to rotate; tap a node to load it.`,
    body:where+`<div class="dgwrap" id="hasse">${s}</div><div class="drow"><label for="phi">Rotate</label><input type="range" id="phi" min="0" max="628" value="${Math.round(((PHI%(2*Math.PI))+2*Math.PI)%(2*Math.PI)*100)}"><button type="button" id="spin" class="dbtn">${SPIN?'Stop':'Spin'}</button></div>`};
}

/* ---------- 2. Truth table ---------- */
function truthTable(a){
  if(a.n>5)return{title:'Truth table',lead:'',body:tooMany(a.n,5,'The truth table')};
  const subs=[],seen=new Set();
  (function walk(f){if(f.t==='atom')return;if(f.a)walk(f.a);if(f.b)walk(f.b);const k=key(f);if(!seen.has(k)){seen.add(k);subs.push(f);}})(a.ast);
  const cols=[...a.vars.map(v=>({h:v,f:{t:'atom',n:v},var:true})),...subs.map(f=>({h:str(f),f}))];
  const last=cols.length-1;
  let h='<div class="tt"><table><thead><tr>'+cols.map((c,i)=>`<th class="${c.var?'tv':''}${i===last?' main':''}">${esc(c.h)}</th>`).join('')+'</tr></thead><tbody>';
  a.rows.forEach(v=>{h+='<tr>'+cols.map((c,i)=>{const b=evalF(c.f,v);return`<td class="${b?'t':'f'}${c.var?' tv':''}${i===last?' main':''}">${TF(b)}</td>`;}).join('')+'</tr>';});
  h+='</tbody></table></div>';
  const k=a.vals.filter(Boolean).length;
  const kind=k===a.vals.length?'a tautology (true in every row)':k===0?'a contradiction (false in every row)':`contingent: true in ${k} of ${a.vals.length} rows`;
  return{title:'Truth table',lead:'One row per case. Each column after the letters is a subformula, built up to the whole formula on the right.',body:h+`<p class="dnote">The formula is ${kind}.</p>`};
}

/* ---------- 3. Venn diagrams ---------- */
function venn(a){
  if(a.n>3)return{title:'Venn diagram',lead:'',body:tooMany(a.n,3,'A Venn diagram')+'<p class="dnote">Beyond three letters you need ellipses or other shapes, and the regions become hard to read.</p>'};
  const W=360,H=270,R={x:10,y:10,w:340,h:250};
  const C=[[],[{x:180,y:140,r:82}],[{x:140,y:140,r:82},{x:220,y:140,r:82}],[{x:146,y:112,r:74},{x:214,y:112,r:74},{x:180,y:174,r:74}]][a.n];
  const shadeIf=b=>VENN==='literal'?!b:b;
  let defs='<defs>'+C.map((c,j)=>`<clipPath id="vc${j}"><circle cx="${c.x}" cy="${c.y}" r="${c.r}"/></clipPath>`).join('');
  let regions='';
  a.rows.forEach((v,k)=>{
    const inn=a.vars.map((x,j)=>v[x]?j:-1).filter(j=>j>=0),out=a.vars.map((x,j)=>v[x]?-1:j).filter(j=>j>=0);
    defs+=`<mask id="vm${k}"><rect x="0" y="0" width="${W}" height="${H}" style="fill:#fff"/>${out.map(j=>`<circle cx="${C[j].x}" cy="${C[j].y}" r="${C[j].r}" style="fill:#000"/>`).join('')}</mask>`;
    let el=`<rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" mask="url(#vm${k})" style="fill:${shadeIf(a.vals[k])?'var(--shade)':'var(--paper)'}"/>`;
    inn.forEach(j=>{el=`<g clip-path="url(#vc${j})">${el}</g>`;});
    regions+=el;});
  defs+='</defs>';
  // case labels at region centroids
  const acc={};for(let x=R.x+3;x<R.x+R.w;x+=5)for(let y=R.y+3;y<R.y+R.h;y+=5){
    const k=C.map(c=>(x-c.x)**2+(y-c.y)**2<c.r*c.r?'T':'F').join('');(acc[k]=acc[k]||[0,0,0]);acc[k][0]+=x;acc[k][1]+=y;acc[k][2]++;}
  let labels='';Object.entries(acc).forEach(([k,[sx,sy,c]])=>{let x=sx/c,y=sy/c;if(!k.includes('T')){x=R.x+R.w-28;y=R.y+R.h-16;}
    labels+=txt(x,y,k,{size:11,f:'font-family:var(--f-mono)',st:MUTED});});
  let s=svgOpen(W,H,'Venn diagram')+defs+regions+`<rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" style="fill:none;stroke:var(--ink);stroke-width:2"/>`+
    C.map(c=>`<circle cx="${c.x}" cy="${c.y}" r="${c.r}" style="fill:none;stroke:var(--ink);stroke-width:2"/>`).join('')+labels;
  const lp=[[],[[95,48]],[[62,48],[298,48]],[[58,40],[302,40],[262,244]]][a.n];
  a.vars.forEach((x,j)=>{s+=txt(lp[j][0],lp[j][1],x,{size:20,st:INK+';font-style:italic'});});
  s+='</svg>';
  const lead=VENN==='literal'
    ?'Literal reading: each circle is a proposition, each region is one case. Shading rules a case out, so the white regions are where the formula is true.'
    :'Set-theoretic reading: each circle is the set of cases where its letter is true. The formula picks out a set of cases, and that set is shaded.';
  return{title:'Venn diagram',lead,body:`<div class="seg2" role="group" aria-label="Venn reading"><button type="button" data-venn="literal" aria-pressed="${VENN==='literal'}">Literal (shaded = false)</button><button type="button" data-venn="set" aria-pressed="${VENN==='set'}">Set-theoretic (shaded = true)</button></div><div class="dgwrap">${s}</div><p class="dnote">The small labels give each region’s case, in the order ${a.vars.join(', ')||'(no letters)'}.</p>`};
}

/* ---------- 4. ROBDD ---------- */
function robdd(a){
  if(a.n>5)return{title:'ROBDD',lead:'',body:tooMany(a.n,5,'The ROBDD view')};
  const order=a.vars.map((_,i)=>a.vars[(i+BDDROT)%a.n]);
  const uniq=new Map(),nodes=[];
  const T={id:'1',leaf:true,term:true},Fz={id:'0',leaf:true,term:false};
  function mk(level,asg){
    if(level===a.n)return evalF(a.ast,asg)?T:Fz;
    const v=order[level];
    const hi=mk(level+1,{...asg,[v]:true}),lo=mk(level+1,{...asg,[v]:false});
    if(hi===lo)return hi;
    const k=v+'|'+hi.id+'|'+lo.id;
    if(!uniq.has(k)){const nd={id:'n'+nodes.length,v,level,hi,lo};uniq.set(k,nd);nodes.push(nd);}
    return uniq.get(k);
  }
  const root=mk(0,{});
  const byLevel=order.map(()=>[]);const seen=new Set();
  (function dfs(nd){if(nd.leaf||seen.has(nd.id))return;seen.add(nd.id);byLevel[nd.level].push(nd);dfs(nd.hi);dfs(nd.lo);})(root);
  const W=360,levelH=74,top=36,H=(root.leaf?top:top+a.n*levelH)+50;
  const termY=root.leaf?top+4:top+a.n*levelH;
  const usedT=[];(function f(nd,s=new Set()){if(nd.leaf){if(!usedT.includes(nd))usedT.push(nd);return;}if(s.has(nd.id))return;s.add(nd.id);f(nd.hi,s);f(nd.lo,s);})(root);
  const P={};
  usedT.forEach(t=>{P[t.id]={x:usedT.length===1?W/2:(t.term?W*0.7:W*0.3),y:termY};});
  for(let i=byLevel.length-1;i>=0;i--){const lv=byLevel[i];
    lv.forEach(nd=>{nd.pref=(P[nd.hi.id].x+P[nd.lo.id].x)/2;});
    lv.sort((p,q)=>p.pref-q.pref);
    const xs=lv.map(nd=>nd.pref);const minGap=64;
    for(let j=1;j<xs.length;j++)xs[j]=Math.max(xs[j],xs[j-1]+minGap);
    const over=xs.length?Math.max(0,xs[xs.length-1]-(W-30)):0;for(let j=0;j<xs.length;j++)xs[j]-=over;
    for(let j=0;j<xs.length;j++)xs[j]=Math.max(xs[j],30+j*minGap);
    lv.forEach((nd,j)=>{P[nd.id]={x:xs[j],y:top+i*levelH};});}
  let s=svgOpen(W,H,'Reduced ordered binary decision diagram');
  const edge=(p,q,hi)=>{const a1=P[p],b=P[q];const skip=Math.max(1,Math.round((b.y-a1.y)/levelH));const bend=(hi?14:-14)*skip;const mx=(a1.x+b.x)/2+bend,my=(a1.y+b.y)/2;
    return`<path d="M${a1.x} ${a1.y} Q${mx} ${my} ${b.x} ${b.y}" style="fill:none;stroke:var(--ink);stroke-width:2${hi?'':';stroke-dasharray:6 5'}"/>`;};
  const all=[...seen].map(id=>nodes.find(n=>n.id===id));
  all.forEach(nd=>{s+=edge(nd.id,nd.hi.id,true)+edge(nd.id,nd.lo.id,false);});
  all.forEach(nd=>{const p=P[nd.id];s+=`<circle cx="${p.x}" cy="${p.y}" r="18" style="fill:var(--paper);stroke:var(--ink);stroke-width:2"/>`+txt(p.x,p.y,nd.v,{size:18,st:INK+';font-style:italic'});});
  usedT.forEach(t=>{const p=P[t.id];s+=`<rect x="${p.x-18}" y="${p.y-16}" width="36" height="32" rx="4" style="fill:${t.term?'var(--okbg)':'var(--badbg)'};stroke:var(--ink);stroke-width:2"/>`+txt(p.x,p.y,t.term?'1':'0',{size:17,w:600,f:'font-family:var(--f-mono)'});});
  s+='</svg>';
  const count=all.length;
  return{title:'Reduced ordered binary decision diagram',
    lead:'Start at the top and test one letter at a time: follow the solid line if it’s true, the dashed line if it’s false, until you reach 1 (true) or 0 (false). Repeated tests and duplicate branches are merged, so for a fixed letter order the diagram is unique.',
    body:`<div class="dgwrap">${s}</div><div class="drow"><span class="dnote" style="margin:0">Order: <strong>${order.join(' < ')||'—'}</strong> · ${count} decision node${count===1?'':'s'}</span>${a.n>1?'<button type="button" class="dbtn" id="bddrot">Change order</button>':''}</div><p class="dnote">Changing the order can change the size. Equivalent formulas always give the same diagram.</p>`};
}

/* ---------- 5. Frege's Begriffsschrift ---------- */
function frege(a){
  const N=x=>x.t==='not'?x.a:{t:'not',a:x},I=(p,q)=>({t:'imp',a:p,b:q});
  function fr(f){switch(f.t){case'atom':case'bot':return f;case'not':return N(fr(f.a));case'imp':return I(fr(f.a),fr(f.b));
    case'and':return N(I(fr(f.a),N(fr(f.b))));case'or':return I(N(fr(f.a)),fr(f.b));
    case'iff':{const p=fr(f.a),q=fr(f.b);return N(I(I(p,q),N(I(q,p))));}}}
  const g=fr(a.ast);
  const rows=f=>f.t==='imp'?rows(f.a)+rows(f.b):f.t==='not'?rows(f.a):1;
  const depth=f=>f.t==='imp'?1+Math.max(depth(f.a),depth(f.b)):f.t==='not'?1+depth(f.a):0;
  const seg=30,rowH=40,x0=20,LX=x0+seg+depth(g)*seg+8,W=Math.max(260,LX+60),H=rows(g)*rowH+20;
  let s=svgOpen(W,H,'Frege’s conceptual notation');
  function draw(f,x,y){
    if(f.t==='atom'||f.t==='bot'){s+=line(x,y,LX,y)+txt(LX+8,y,f.t==='bot'?'⊥':f.n,{a:'start',size:20,st:INK+';font-style:italic'});return;}
    if(f.t==='not'){s+=line(x,y,x+seg,y)+line(x+seg/2,y,x+seg/2,y+11);draw(f.a,x+seg,y);return;}
    const yb=y+rows(f.b)*rowH;
    s+=line(x,y,x+seg,y)+line(x+seg,y,x+seg,yb);draw(f.b,x+seg,y);draw(f.a,x+seg,yb);
  }
  s+=line(x0,20,x0+seg,20);draw(g,x0+seg,20);s+='</svg>';
  return{title:'Frege’s conceptual notation (Begriffsschrift, 1879)',
    lead:'Frege used only “not” and “if…then”. A horizontal stroke carries content; a small tick under it negates; a vertical stroke joins a condition (below) to what it conditions (above). So “if Q then P” has P on top and Q hanging underneath.',
    body:`<div class="dgwrap">${s}</div><p class="dnote">Rewritten with ¬ and → only: <span class="fm">${esc(str(g))}</span>${g.t!==a.ast.t||str(g)!==str(a.ast)?' (∧, ∨ and ↔ are translated, and double negations dropped)':''}.</p>`};
}

/* ---------- 6. Peirce's alpha graphs ---------- */
function peirce(a){
  const cut=items=>({k:'cut',items});
  function pc(f){switch(f.t){
    case'atom':return[{k:'atom',n:f.n}];case'bot':return[cut([])];
    case'not':return[cut(pc(f.a))];case'and':return[...pc(f.a),...pc(f.b)];
    case'or':return[cut([cut(pc(f.a)),cut(pc(f.b))])];
    case'imp':return[cut([...pc(f.a),cut(pc(f.b))])];
    case'iff':return[cut([...pc(f.a),cut(pc(f.b))]),cut([...pc(f.b),cut(pc(f.a))])];}}
  function dc(items){return items.flatMap(it=>{if(it.k!=='cut')return[it];const inner=dc(it.items);
    if(PEIRCE_DC&&inner.length===1&&inner[0].k==='cut')return inner[0].items;return[cut(inner)];});}
  const g=dc(pc(a.ast));
  const pad=12,gap=12;
  function measure(items){let w=0,h=0;items.forEach((it,i)=>{const m=it.k==='atom'?{w:Math.max(18,it.n.length*13),h:28}:mcut(it);it.m=m;w+=m.w+(i?gap:0);h=Math.max(h,m.h);});return{w:Math.max(w,0),h:Math.max(h,items.length?0:0)};}
  function mcut(c){const m=measure(c.items);return c.items.length?{w:m.w+2*pad+8,h:m.h+2*pad}:{w:34,h:28};}
  const top=measure(g);
  const W=Math.max(220,top.w+48),H=Math.max(90,top.h+48);
  let s=svgOpen(W,H,'Peirce’s alpha graph')+`<rect x="4" y="4" width="${W-8}" height="${H-8}" rx="6" style="fill:var(--paper);stroke:var(--muted);stroke-width:1.5"/>`;
  function draw(items,x,cy,depth){items.forEach(it=>{const m=it.m;
    if(it.k==='atom')s+=txt(x+m.w/2,cy,it.n,{size:20,st:INK+';font-style:italic'});
    else{s+=`<rect x="${x}" y="${cy-m.h/2}" width="${m.w}" height="${m.h}" rx="${Math.min(m.h/2,22)}" style="fill:${(depth+1)%2?'var(--field)':'var(--paper)'};stroke:var(--ink);stroke-width:2"/>`;
      const inner=measure(it.items);draw(it.items,x+(m.w-inner.w)/2,cy,depth+1);}
    x+=m.w+gap;});}
  measure(g);draw(g,(W-top.w)/2,H/2,0);
  s+=txt(W-10,H-14,'sheet of assertion',{a:'end',size:10,f:'font-family:var(--f-body)',st:MUTED})+'</svg>';
  return{title:'Peirce’s alpha graphs (existential graphs, c. 1896)',
    lead:'Writing something on the sheet asserts it, and writing two things side by side asserts both. A closed curve (a “cut”) denies what’s inside. Everything else is built from these: “if P then Q” is a cut containing P and a cut around Q, and an empty cut is a falsehood.',
    body:`<div class="dgwrap">${s}</div><label class="dchk"><input type="checkbox" id="dc"${PEIRCE_DC?' checked':''}> Remove double cuts (Peirce’s double-cut rule)</label><p class="dnote">Shaded areas sit inside an odd number of cuts (negative areas).</p>`};
}

/* ---------- 7. Wittgenstein's Tractatus ---------- */
function tractatus(a){
  if(a.n>4)return{title:'Tractatus',lead:'',body:tooMany(a.n,4,'The Tractatus view')};
  const cases=a.rows.map((v,k)=>({v,val:a.vals[k],fpos:a.vars.map((x,j)=>v[x]?-1:j).filter(j=>j>=0)}));
  cases.sort((p,q)=>p.fpos.length-q.fpos.length||(()=>{for(let i=0;i<p.fpos.length;i++)if(p.fpos[i]!==q.fpos[i])return p.fpos[i]-q.fpos[i];return 0;})());
  const sign=`(${cases.map(c=>TF(c.val)).join('')})(${a.vars.map(x=>x.toLowerCase()).join(', ')})`;
  const colW=34,rowH=30,x0=24,top=44,nx=x0+a.n*colW,bx=nx+6,W=Math.max(300,nx+170),H=top+cases.length*rowH+16;
  const tY=top+(cases.length*rowH)*0.3,fY=top+(cases.length*rowH)*0.7,tx=W-40;
  let s=svgOpen(W,H,'Tractatus truth-possibilities diagram');
  a.vars.forEach((x,j)=>{s+=txt(x0+j*colW+colW/2,top-22,x.toLowerCase(),{size:19,st:INK+';font-style:italic'});});
  cases.forEach((c,i)=>{const y=top+i*rowH+rowH/2;
    a.vars.forEach((x,j)=>{s+=txt(x0+j*colW+colW/2,y,TF(c.v[x]),{size:15,f:'font-family:var(--f-mono)',st:c.v[x]?INK:MUTED});});
    s+=`<path d="M${bx} ${y-11} q6 0 6 6 v2 q0 3 4 3 q-4 0 -4 3 v2 q0 6 -6 6" style="fill:none;stroke:var(--muted);stroke-width:1.5"/>`;
    s+=line(bx+12,y,tx-16,c.val?tY:fY,c.val?'stroke:var(--ink)':'stroke:var(--muted)',c.val?2:1.5);});
  s+=`<circle cx="${tx}" cy="${tY}" r="15" style="fill:var(--okbg);stroke:var(--ink);stroke-width:2"/>`+txt(tx,tY,'T',{size:16,w:600,f:'font-family:var(--f-mono)'});
  s+=`<circle cx="${tx}" cy="${fY}" r="15" style="fill:var(--badbg);stroke:var(--ink);stroke-width:2"/>`+txt(tx,fY,'F',{size:16,w:600,f:'font-family:var(--f-mono)'});
  s+='</svg>';
  return{title:'Wittgenstein’s Tractatus (1921)',
    lead:'Wittgenstein lists the truth-possibilities of the elementary propositions (4.31), brackets each one, and joins it to T or F (4.442). The whole proposition can then be written as a single sign: its column of truth values followed by its letters (5.101).',
    body:`<p class="sign">${esc(sign)}</p><div class="dgwrap">${s}</div><p class="dnote">Cases follow the Tractatus order: all true first, then one false, then two, and so on. Letters are lower case, as Wittgenstein wrote them.</p>`};
}

/* ---------- 8. Truth diagrams (Cheng) ---------- */
function truthDiagram(a){
  if(a.n>4)return{title:'Truth diagram',lead:'',body:tooMany(a.n,4,'The truth diagram')};
  const n=Math.max(a.n,1),gapX=96,x0=50,hiY=46,loY=166,midY=106;
  const W=Math.max(260,x0*2+(n-1)*gapX),H=212;
  const xs=a.vars.map((_,j)=>a.n===1?W/2:x0+j*gapX+(W-(x0*2+(a.n-1)*gapX))/2);
  const m=a.rows.length,d=Math.min(4,34/Math.max(1,m));
  let s=svgOpen(W,H,'Truth diagram');
  const conns=a.rows.map((v,k)=>{const off=(k-(m-1)/2)*d;
    const pts=a.vars.map((x,j)=>[xs[j],(v[x]?hiY:loY)+off]);
    if(a.n===1)return{d:`M${pts[0][0]-34} ${pts[0][1]} L${pts[0][0]+34} ${pts[0][1]}`,t:a.vals[k]};
    return{d:'M'+pts.map(p=>p.join(' ')).join(' L'),t:a.vals[k]};});
  if(a.n===0){s+=txt(W/2,midY,a.vals[0]?'true':'false',{size:18});}
  conns.filter(c=>!c.t).forEach(c=>{s+=`<path d="${c.d}" style="fill:none;stroke:var(--faint);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>`;});
  conns.filter(c=>c.t).forEach(c=>{s+=`<path d="${c.d}" style="fill:none;stroke:var(--ink);stroke-width:3.2;stroke-linejoin:round;stroke-linecap:round"/>`;});
  a.vars.forEach((x,j)=>{s+=`<circle cx="${xs[j]}" cy="${hiY}" r="4" style="fill:var(--paper);stroke:var(--muted)"/><circle cx="${xs[j]}" cy="${loY}" r="4" style="fill:var(--paper);stroke:var(--muted)"/>`;
    s+=`<rect x="${xs[j]-14}" y="${midY-16}" width="28" height="32" rx="6" style="fill:var(--paper)"/>`+txt(xs[j],midY,x,{size:22,st:INK+';font-style:italic'});});
  if(a.n)s+=txt(10,hiY,'T',{a:'start',size:12,f:'font-family:var(--f-mono)',st:MUTED})+txt(10,loY,'F',{a:'start',size:12,f:'font-family:var(--f-mono)',st:MUTED});
  s+='</svg>';
  const k=a.vals.filter(Boolean).length;
  return{title:'Truth diagram (Cheng, 2020)',
    lead:'Each letter has a high node (true) and a low node (false). Every case is one connector running across the letters through its nodes. A black connector (a “tine”) is a case where the formula is true; a grey one (a “faint”) is a case where it’s false.',
    body:`<div class="dgwrap">${s}</div><p class="dnote">${k} tine${k===1?'':'s'}, ${a.vals.length-k} faint${a.vals.length-k===1?'':'s'}. From Peter Cheng, <a href="https://link.springer.com/article/10.1007/s10849-019-09299-y" target="_blank" rel="noopener">“Truth Diagrams versus extant notations for propositional logic”</a>, which compares truth diagrams with every other notation on this page.</p>`};
}

let LAST=null;
const VIEWS={hasse,table:truthTable,venn,robdd,frege,peirce,tractatus,truthdiagram:truthDiagram};

/* ---------- rendering ---------- */
function render(){
  document.querySelectorAll('#dtabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===VIEW)));
  let a;
  try{a=analyse();$('ferr').textContent='';$('fshow').textContent=str(a.ast);}
  catch(e){$('ferr').textContent=e.message;$('view').innerHTML='';return;}
  LAST=a;const r=(VIEWS[VIEW]||hasse)(a);
  $('view').innerHTML=`<h2>${esc(r.title)}</h2>${r.lead?`<p class="lead">${esc(r.lead)}</p>`:''}${r.body}`;
  bindView();
}
function setF(f){F=f;$('fin').value=f;save();render();}
function bindView(){
  const hs=$('hasse');
  if(hs){
    const redraw=()=>{hs.innerHTML=hasseSVG(LAST);};
    const pick=e=>{const g=e.target.closest('.hn');if(g)setF(g.dataset.f);};
    hs.addEventListener('click',e=>{if(moved)return;pick(e);});
    hs.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(e);}});
    let drag=null,moved=false;
    hs.addEventListener('pointerdown',e=>{drag=e.clientX;moved=false;});
    hs.addEventListener('pointermove',e=>{if(drag==null)return;const dx=e.clientX-drag;if(Math.abs(dx)>2)moved=true;if(!moved)return;PHI+=dx*0.012;drag=e.clientX;redraw();syncPhi();});
    addEventListener('pointerup',()=>{drag=null;});
    $('phi').addEventListener('input',e=>{PHI=+e.target.value/100;redraw();});
    $('spin').addEventListener('click',()=>{SPIN=!SPIN;$('spin').textContent=SPIN?'Stop':'Spin';if(SPIN)spin();});
    HREDRAW=redraw;
  }
  document.querySelectorAll('[data-venn]').forEach(b=>b.addEventListener('click',()=>{VENN=b.dataset.venn;save();render();}));
  if($('bddrot'))$('bddrot').addEventListener('click',()=>{BDDROT++;render();});
  if($('dc'))$('dc').addEventListener('change',e=>{PEIRCE_DC=e.target.checked;render();});
}
let HREDRAW=null;
const syncPhi=()=>{const r=$('phi');if(r)r.value=Math.round(((PHI%(2*Math.PI))+2*Math.PI)%(2*Math.PI)*100);};
function spin(){if(!SPIN||VIEW!=='hasse'||!$('hasse'))return;PHI+=0.012;HREDRAW&&HREDRAW();syncPhi();requestAnimationFrame(spin);}

$('dtabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;VIEW=b.dataset.v;SPIN=false;save();render();});
$('fin').value=F;
$('fin').addEventListener('input',()=>{F=$('fin').value;save();render();});
$('dkeys').addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault();});
$('dkeys').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const inp=$('fin'),k=b.dataset.k;
  const s=inp.selectionStart??inp.value.length,t=inp.selectionEnd??s;inp.value=inp.value.slice(0,s)+k+inp.value.slice(t);inp.setSelectionRange(s+k.length,s+k.length);
  F=inp.value;save();render();});
$('dex').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setF(b.dataset.f);});
render();
})();
