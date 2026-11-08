/* Learn page: renders the content lists in content/*.js */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SEP='https://plato.stanford.edu/entries/';
const SEPNAME={'logic-propositional':'Propositional Logic','logic-classical':'Classical Logic','logical-consequence':'Logical Consequence','natural-deduction':'Natural Deduction','logic-conditionals':'The Logic of Conditionals','logic-intuitionistic':'Intuitionistic Logic'};
const tryLink=s=>s?`<a class="try" href="prove.html?seq=${encodeURIComponent(s)}">Try it in Prove →</a>`:'';
const f=s=>`<span class="fm">${esc(s)}</span>`;
const VIEWS={
  glossary(q){
    const list=PQ_GLOSSARY.filter(g=>!q||(g.term+' '+g.def+' '+g.ex).toLowerCase().includes(q));
    return list.length?list.map(g=>`<article class="entry"><h3>${esc(g.term)}</h3><p>${esc(g.def)}</p><p class="ex"><span class="lbl">Example</span> ${esc(g.ex)}</p><div class="links">${tryLink(g.try)}${g.sep?`<a href="${SEP}${g.sep}/" target="_blank" rel="noopener">SEP: ${esc(SEPNAME[g.sep]||g.sep)}</a>`:''}</div></article>`).join(''):'<p class="empty">No entries match.</p>';
  },
  fallacies(){
    return '<p class="lead">Each looks like a valid rule but fails on one truth-table row. Open one in Prove to see the countermodel.</p>'+PQ_FALLACIES.map(x=>`<article class="entry"><h3>${esc(x.name)}</h3><p>${f(x.form)}</p><p class="ex"><span class="lbl">Looks like</span> ${esc(x.like)}</p><p class="ex"><span class="lbl">Fails when</span> ${esc(x.row)}</p><p>${esc(x.eng)}</p><div class="links">${tryLink(x.form)}</div></article>`).join('');
  },
  ambiguity(){
    return '<p class="lead">Each phrase has two fair symbolisations. They come apart on the row shown.</p>'+PQ_AMBIGUITY.map(x=>`<article class="entry"><h3>${esc(x.phrase)}</h3><div class="pair"><div><span class="lbl">${esc(x.aName||'Reading 1')}</span>${f(x.a)}</div><div><span class="lbl">${esc(x.bName||'Reading 2')}</span>${f(x.b)}</div></div><p class="ex"><span class="lbl">Come apart</span> ${esc(x.apart)}</p><p>${esc(x.note)}</p><div class="links">${tryLink(x.try)}</div></article>`).join('');
  },
  wellformed(){
    return '<p class="lead">Strings the formation rules reject, or accept only by convention.</p>'+PQ_WELLFORMED.map(x=>`<article class="entry"><h3>${f(x.s)}</h3><p>${esc(x.why)}</p><p class="ex"><span class="lbl">Fix</span> ${f(x.fix)}</p></article>`).join('');
  }
};
let view='glossary';
try{view=localStorage.getItem('pandq-learn-view')||'glossary';}catch(e){}
function render(){
  document.querySelectorAll('#ltabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===view)));
  $('searchrow').hidden=view!=='glossary';
  $('list').innerHTML=VIEWS[view](($('q').value||'').trim().toLowerCase());
}
$('ltabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.v;try{localStorage.setItem('pandq-learn-view',view);}catch(e){}render();});
$('q').addEventListener('input',render);
render();
})();
