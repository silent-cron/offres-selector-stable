// Fonctions Date/Retour/Historique
function updateDate(url,val){
  var c=getCfg();
  var g=genereesData.find(function(x){return x.url===url});
  if(g&&val)g.date_candidature=val;
  var inp=document.querySelector('input[type=date].dch-'+url.replace(/[^a-zA-Z0-9]/g,''));
  if(inp)inp.value=val;
  var ls=JSON.parse(localStorage.getItem('ls_dates')||'{}');
  ls[url]=val;localStorage.setItem('ls_dates',JSON.stringify(ls));
  if(g&&val&&g.retour){
    if(!g.historique)g.historique=[];
    g.historique.push({type:g.retour,date:val,notes:''});
  }
  if(c.pat){
    fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/actions/workflows/update_status.yml/dispatches',
      {method:'POST',headers:{'Authorization':'Bearer '+c.pat,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({ref:c.branch,inputs:{url:url,field:'date_candidature',value:val}})}).catch(function(){});
  }
}
function updateRetour(url,val){
  var c=getCfg();
  var g=genereesData.find(function(x){return x.url===url});
  if(g)g.retour=val;
  var ls=JSON.parse(localStorage.getItem('ls_retours')||'{}');
  ls[url]=val;localStorage.setItem('ls_retours',JSON.stringify(ls));
  if(g&&val&&g.date_candidature){
    if(!g.historique)g.historique=[];
    g.historique.push({type:val,date:g.date_candidature,notes:''});
    g.retour='';
    var sel=document.querySelector('select[onchange^="updateRetour(\\''+url+'\\'"]');
    if(sel)sel.value='';
    var ls=JSON.parse(localStorage.getItem('ls_retours')||'{}');
    ls[url]='';
    localStorage.setItem('ls_retours',JSON.stringify(ls));
  }
  if(c.pat){
    fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/actions/workflows/update_status.yml/dispatches',
      {method:'POST',headers:{'Authorization':'Bearer '+c.pat,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({ref:c.branch,inputs:{url:url,field:'retour',value:val}})}).catch(function(){});
  }
}
function showHistorique(u){
  var g=genereesByUrl[u];if(!g)return;
  var h='<div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,0.15);">';
  h+='<h3 style="margin:0 0 4px;font-size:1rem;">📋 '+(g.entreprise||'')+'</h3>';
  h+='<p style="margin:0 0 16px;color:#666;font-size:0.82rem;">'+(g.titre||'')+'</p>';
  var evts=g.historique||[];
  h+='<div style="border-left:3px solid #667eea;padding-left:16px;">';
  for(var j=0;j<evts.length;j++){
    var e=evts[j];
    var icon=e.type==='relance'?'📬':e.type==='entretien'?'📞':e.type==='resultat'?(e.notes==='positif'?'✅':'❌'):e.type==='postule'?'📋':e.type==='positif'?'✅':e.type==='negatif'?'❌':e.type==='pas_de_reponse'?'🤷':'📌';
    h+='<div style="margin-bottom:12px;"><span style="font-weight:700;font-size:0.85rem;">'+icon+' '+e.date+'</span><br><span style="color:#555;font-size:0.8rem;">'+e.type+(e.notes?' - '+e.notes:'')+'</span></div>';
  }
  h+='</div><div style="margin-top:16px;display:flex;gap:6px;flex-wrap:wrap;">';
  var su=encodeURIComponent(u);
  h+='<button onclick="addEvent(\''+u+'\',\'relance\',\'\')" style="background:#f59e0b;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">📬 Relancer</button>';
  h+='<button onclick="addEvent(\''+u+'\',\'entretien\',\'\')" style="background:#8b5cf6;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">📞 Entretien</button>';
  h+='<button onclick="addEvent(\''+u+'\',\'resultat\',\'positif\')" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">✅ Positif</button>';
  h+='<button onclick="addEvent(\''+u+'\',\'resultat\',\'negatif\')" style="background:#dc2626;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">❌ Negatif</button>';
  h+='</div><div style="margin-top:16px;text-align:right;"><button onclick="document.getElementById(\'hist-modal\').style.display=\'none\'" style="background:#f3f4f6;color:#555;border:none;border-radius:6px;padding:5px 14px;font-size:0.8rem;cursor:pointer;">Fermer</button></div></div>';
  var modal=document.getElementById('hist-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='hist-modal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;';
    document.body.appendChild(modal);
  }
  modal.innerHTML=h;
  modal.style.display='flex';
}
function addEvent(url, type, val) {
  var c=getCfg();if(!c.pat)return;
  var notes=prompt('Notes pour cet evenement (optionnel) :','');
  fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/actions/workflows/add_event.yml/dispatches',
    {method:'POST',headers:{'Authorization':'Bearer '+c.pat,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
    body:JSON.stringify({ref:c.branch,inputs:{url:url,type:type,valeur:val||notes||''}})}).catch(function(){});
  setTimeout(function(){location.reload()},3000);
}
