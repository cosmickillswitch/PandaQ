/* ---------- formulas ---------- */
const BOT={t:'bot'};
const mk=(t,a,b)=>({t,a,b});
const PREC={iff:1,imp:2,or:3,and:4,not:5,atom:6,bot:6};
const SYM={and:'∧',or:'∨',imp:'→',iff:'↔'};
function key(f){switch(f.t){case'atom':return f.n;case'bot':return'⊥';case'not':return'¬'+key(f.a);default:return'('+key(f.a)+SYM[f.t]+key(f.b)+')';}}
function str(f){
  if(f.t==='atom')return f.n; if(f.t==='bot')return'⊥';
  if(f.t==='not'){const s=str(f.a);return'¬'+(f.a.t==='atom'||f.a.t==='bot'||f.a.t==='not'?s:'('+s+')');}
  const wrap=(c,right)=>{const s=str(c);if(c.t==='atom'||c.t==='bot'||c.t==='not')return s;
    if(c.t===f.t&&(f.t==='and'||f.t==='or'||(f.t==='imp'&&right)))return s;return'('+s+')';};
  return wrap(f.a,false)+' '+SYM[f.t]+' '+wrap(f.b,true);
}
function tokenize(s){
  const toks=[];let i=0;
  const map=[['<->','iff'],['<=>','iff'],['↔','iff'],['≡','iff'],['->','imp'],['=>','imp'],['→','imp'],['⊃','imp'],['/\\','and'],['∧','and'],['&&','and'],['&','and'],['^','and'],['\\/','or'],['∨','or'],['||','or'],['|','or'],['¬','not'],['~','not'],['!','not'],['-','not'],['⊥','bot'],['#','bot'],['(','('],[')',')']];
  while(i<s.length){const c=s[i];if(/\s/.test(c)){i++;continue;}
    const m=map.find(([k])=>s.startsWith(k,i));if(m){toks.push({t:m[1]});i+=m[0].length;continue;}
    const w=/^[A-Za-z][A-Za-z0-9_']*/.exec(s.slice(i));
    if(w){const word=w[0],lw=word.toLowerCase();
      const kw={and:'and',or:'or',not:'not',implies:'imp',iff:'iff',bot:'bot',false:'bot'};
      toks.push(kw[lw]?{t:kw[lw]}:{t:'atom',n:word});i+=word.length;continue;}
    throw new Error('I don’t recognise the symbol “'+c+'”.');
  }
  return toks;
}
function parse(s){
  const toks=tokenize(s);let p=0;
  const peek=()=>toks[p]&&toks[p].t;
  const iff=()=>{let l=imp();while(peek()==='iff'){p++;l=mk('iff',l,imp());}return l;};
  const imp=()=>{const l=or();if(peek()==='imp'){p++;return mk('imp',l,imp());}return l;};
  const or=()=>{let l=and();while(peek()==='or'){p++;l=mk('or',l,and());}return l;};
  const and=()=>{let l=un();while(peek()==='and'){p++;l=mk('and',l,un());}return l;};
  const un=()=>{const t=toks[p];
    if(!t)throw new Error('The formula ends too early.');
    if(t.t==='not'){p++;return mk('not',un());}
    if(t.t==='('){p++;const f=iff();if(peek()!==')')throw new Error('A “(” is missing its “)”.');p++;return f;}
    if(t.t==='atom'){p++;return{t:'atom',n:t.n};}
    if(t.t==='bot'){p++;return BOT;}
    throw new Error('Expected a formula but found “'+(SYM[t.t]||t.t)+'”.');};
  if(!toks.length)throw new Error('Empty formula.');
  const f=iff();if(p<toks.length)throw new Error('Unexpected “'+(SYM[toks[p].t]||toks[p].n||toks[p].t)+'” after a complete formula.');
  return f;
}
function splitTop(s){const out=[];let d=0,cur='';for(const c of s){if(c==='(')d++;if(c===')')d--;if(c===','&&d===0){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out.map(x=>x.trim()).filter(Boolean);}
function parseSequent(s){
  const parts=s.split(/⊢|\|-|\|=|⊨/);
  if(parts.length>2)throw new Error('Use only one ⊢.');
  const prem=parts.length===2?splitTop(parts[0]).map(parse):[];
  const concl=(parts.length===2?parts[1]:parts[0]).trim();
  if(!concl)throw new Error('Add a conclusion after ⊢.');
  return{premises:prem,goal:parse(concl)};
}
function atoms(f,set=new Set()){if(f.t==='atom')set.add(f.n);else if(f.a){atoms(f.a,set);if(f.b)atoms(f.b,set);}return set;}
function evalF(f,v){switch(f.t){case'atom':return v[f.n];case'bot':return false;case'not':return!evalF(f.a,v);case'and':return evalF(f.a,v)&&evalF(f.b,v);case'or':return evalF(f.a,v)||evalF(f.b,v);case'imp':return!evalF(f.a,v)||evalF(f.b,v);case'iff':return evalF(f.a,v)===evalF(f.b,v);}}
function countermodel(prem,goal){
  const as=[...[goal,...prem].reduce((s,f)=>atoms(f,s),new Set())];
  if(as.length>14)return undefined;
  for(let m=0;m<(1<<as.length);m++){const v={};as.forEach((a,i)=>v[a]=!!(m>>i&1));
    if(prem.every(p=>evalF(p,v))&&!evalF(goal,v))return v;}
  return null;
}
const sub=(g,f)=>key(f)===key(g)||(f.a&&(sub(g,f.a)||(f.b&&sub(g,f.b))));
const hasNeg=f=>f.t==='not'||f.t==='bot'||(f.a&&(hasNeg(f.a)||(f.b&&hasNeg(f.b))));

/* ---------- prover ---------- */
const LIMIT={};
function proveSequent(premises,goal,logic){
  let lines=[],nodes=0;const MAXN=250000;
  const emit=(f,rule,refs,depth,extra)=>{lines.push(Object.assign({f,rule,refs,depth},extra||{}));return lines.length-1;};
  const find=(ctx,f)=>{const k=key(f);return ctx.find(e=>e.k===k);};
  const addCtx=(ctx,f,ln)=>find(ctx,f)?ctx:[...ctx,{f,k:key(f),ln}];
  function saturate(ctx,d){
    ctx=ctx.slice();let changed=true,guard=0;
    const push=(f,rule,refs)=>{if(find(ctx,f))return false;ctx.push({f,k:key(f),ln:emit(f,rule,refs,d)});return true;};
    while(changed&&guard++<12&&ctx.length<80){changed=false;
      for(let i=0;i<ctx.length;i++){const e=ctx[i],f=e.f;
        if(f.t==='and'){if(push(f.a,'∧E',[e.ln]))changed=true;if(push(f.b,'∧E',[e.ln]))changed=true;}
        else if(f.t==='imp'){const a=find(ctx,f.a);if(a&&push(f.b,'→E',[e.ln,a.ln]))changed=true;}
        else if(f.t==='iff'){let a=find(ctx,f.a);if(a&&push(f.b,'↔E',[e.ln,a.ln]))changed=true;a=find(ctx,f.b);if(a&&push(f.a,'↔E',[e.ln,a.ln]))changed=true;}
        else if(f.t==='not'){const a=find(ctx,f.a);if(a&&push(BOT,'¬E',[a.ln,e.ln]))changed=true;}
      }}
    return ctx;
  }
  function prove(goal,ctx,d,depth,used,stack){
    if(++nodes>MAXN)throw LIMIT;
    const mark=lines.length;
    ctx=saturate(ctx,d);
    const hit=find(ctx,goal);if(hit)return hit.ln;
    const bot=find(ctx,BOT);
    if(bot&&logic!=='minimal')return emit(goal,'X',[bot.ln],d);
    const sk=key(goal)+'|'+ctx.map(e=>e.k).sort().join(',');
    if(stack.has(sk)){lines.length=mark;return null;}
    stack.add(sk);
    const sat=lines.length;const reset=()=>{lines.length=sat;};
    const subp=(assume,target,purpose,dd,u)=>{
      const s=emit(assume,'Assumption',[],d+1,{purpose,target});
      let ln=prove(target,addCtx(ctx,assume,s),d+1,dd,u||used,stack);
      if(ln==null){lines.length=s;return null;}
      if(ln<s)ln=emit(target,'R',[ln],d+1);
      return[s,ln];
    };
    const g=goal;
    const attempt=()=>{
      if(g.t==='imp'){const r=subp(g.a,g.b,'imp',depth);return r?emit(g,'→I',[r],d):null;}
      if(g.t==='not'){const r=subp(g.a,BOT,'not',depth);return r?emit(g,'¬I',[r],d):null;}
      if(g.t==='and'){const a=prove(g.a,ctx,d,depth,used,stack);if(a==null)return null;
        const b=prove(g.b,ctx,d,depth,used,stack);if(b==null){reset();return null;}return emit(g,'∧I',[a,b],d);}
      if(g.t==='iff'){const r1=subp(g.a,g.b,'iff1',depth);if(!r1)return null;const r2=subp(g.b,g.a,'iff2',depth);if(!r2){reset();return null;}return emit(g,'↔I',[r1,r2],d);}
      if(g.t==='or'){const a=find(ctx,g.a)||find(ctx,g.b);if(a)return emit(g,'∨I',[a.ln],d);}
      if(depth<=0)return null;
      if(g.t==='or'){for(const side of[g.a,g.b]){const a=prove(side,ctx,d,depth-1,used,stack);if(a!=null)return emit(g,'∨I',[a],d);reset();}}
      for(const e of ctx){const f=e.f;
        const dirs=f.t==='imp'?[[f.a,f.b]]:f.t==='iff'?[[f.a,f.b],[f.b,f.a]]:[];
        for(const[A,B]of dirs){
          if(find(ctx,B))continue;
          if(!(sub(g,B)||B.t==='bot'||B.t==='or'||(g.t==='bot'&&hasNeg(B))))continue;
          const a=prove(A,ctx,d,depth-1,used,stack);if(a==null){reset();continue;}
          const bl=emit(B,f.t==='imp'?'→E':'↔E',[e.ln,a],d);
          const r=prove(g,addCtx(ctx,B,bl),d,depth-1,used,stack);if(r==null){reset();continue;}
          return r;}
      }
      if(g.t==='bot'){for(const e of ctx){if(e.f.t!=='not')continue;
        const a=prove(e.f.a,ctx,d,depth-1,used,stack);if(a==null){reset();continue;}return emit(BOT,'¬E',[a,e.ln],d);}}
      for(const e of ctx){if(e.f.t!=='or'||used.includes(e.k))continue;
        const u2=[...used,e.k];
        const r1=subp(e.f.a,g,'case1',depth-1,u2);if(!r1)continue;
        const r2=subp(e.f.b,g,'case2',depth-1,u2);if(!r2){reset();continue;}
        lines[r1[0]].disj=e.ln;lines[r2[0]].disj=e.ln;
        return emit(g,'∨E',[e.ln,r1,r2],d);}
      if(logic!=='minimal'&&g.t!=='bot'&&ctx.some(e=>hasNeg(e.f))){
        const b=prove(BOT,ctx,d,depth-1,used,stack);if(b!=null)return emit(g,'X',[b],d);reset();}
      if(logic==='classical'&&g.t!=='bot'&&!find(ctx,mk('not',g))){
        const r=subp(mk('not',g),BOT,'ip',depth-1);if(r)return emit(g,'IP',[r],d);}
      return null;
    };
    const r=attempt();
    stack.delete(sk);
    if(r==null)lines.length=mark;
    return r;
  }
  let found=null,gaveUp=false;
  try{
    for(let D=0;D<=9&&found==null;D++){
      lines=[];const ctx=[];
      premises.forEach(p=>{const k=key(p);if(!ctx.some(e=>e.k===k))ctx.push({f:p,k,ln:emit(p,'Premise',[],0)});else emit(p,'Premise',[],0);});
      let r=prove(goal,ctx,0,D,[],new Set());
      if(r!=null){if(r<premises.length)r=emit(goal,'R',[r],0);found=r;}
    }
  }catch(e){if(e!==LIMIT)throw e;gaveUp=true;}
  if(found==null)return{ok:false,gaveUp};
  // prune unused lines
  const need=new Set(premises.map((_,i)=>i)),q=[found];
  while(q.length){const i=q.pop();if(need.has(i)&&i!==found&&i>=premises.length)continue;need.add(i);
    for(const r of lines[i].refs){for(const x of(Array.isArray(r)?r:[r]))if(!need.has(x))q.push(x);}
    if(lines[i].disj!=null&&!need.has(lines[i].disj))q.push(lines[i].disj);}
  const keep=[...need].sort((a,b)=>a-b),num={};keep.forEach((o,i)=>num[o]=i+1);
  const out=keep.map(o=>{const L=lines[o];return Object.assign({},L,{refs:L.refs.map(r=>Array.isArray(r)?r.map(x=>num[x]):num[r]),disj:L.disj!=null?num[L.disj]:undefined});});
  return{ok:true,lines:out};
}
