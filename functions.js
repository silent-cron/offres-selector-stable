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
    try{localStorage.setItem('ls_hist_'+url,JSON.stringify(g.historique));}catch(e){}
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
    try{localStorage.setItem('ls_hist_'+url,JSON.stringify(g.historique));}catch(e){}
      }
  if(c.pat){
    fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/actions/workflows/update_status.yml/dispatches',
      {method:'POST',headers:{'Authorization':'Bearer '+c.pat,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
      body:JSON.stringify({ref:c.branch,inputs:{url:url,field:'retour',value:val}})}).catch(function(){});
  }
}
function showHistorique(u){
  var g=genereesByUrl&&genereesByUrl[u];if(!g&&typeof genereesData!=='undefined')g=genereesData.find(function(x){return x.url===u});if(!g)return;
  var h='<div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,0.15);">';
  h+='<h3 style="margin:0 0 4px;font-size:1rem;">📋 '+(g.entreprise||'')+'</h3>';
  h+='<p style="margin:0 0 16px;color:#666;font-size:0.82rem;">'+(g.titre||'')+'</p>';
  var evts=g.historique||[];
  h+='<div style="border-left:3px solid #667eea;padding-left:16px;">';
  for(var j=0;j<evts.length;j++){
    var e=evts[j];
    var icon=e.type==='Offres générés'?'🎯':e.type==='relance'?'📬':e.type==='entretien'?'📞':e.type==='resultat'?(e.notes==='positif'?'✅':'❌'):e.type==='postule'?'📋':e.type==='positif'?'✅':e.type==='negatif'?'❌':e.type==='pas_de_reponse'?'🤷':'📌';
    h+='<div style="margin-bottom:12px;"><span style="font-weight:700;font-size:0.85rem;">'+icon+' '+e.date+'</span><br><span style="color:#555;font-size:0.8rem;">'+e.type+(e.notes?' - '+e.notes:'')+'</span></div>';
  }
  h+='</div><div style="margin-top:16px;display:flex;gap:6px;flex-wrap:wrap;">';
  var su=encodeURIComponent(u);
  h+='<button onclick="addEvent(\''+u+'\',\'postule\',\'\')" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">📋 Postulé</button>';h+='<button onclick="addEvent(\''+u+'\',\'relance\',\'\')" style="background:#f59e0b;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:0.75rem;cursor:pointer;">📬 Relancer</button>';
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
  var c=getCfg();
  var dt=new Date().toISOString().split('T')[0];
  var g=genereesByUrl&&genereesByUrl[url];
  if(!g&&typeof genereesData!=='undefined')g=genereesData.find(function(x){return x.url===url});
  if(!g)g={url:url,historique:[]};
  if(!g.historique)g.historique=[];
  var notes=prompt('Notes pour cet evenement (optionnel) :','');
  g.historique.push({type:type,date:dt,notes:notes||''});
  try{localStorage.setItem('ls_hist_'+url,JSON.stringify(g.historique));}catch(e){}
  if(genereesByUrl&&url)genereesByUrl[url]=g;
  if(typeof showHistorique==='function')showHistorique(url);
  if(c.pat&&c.owner&&c.repo){
    fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/candidatures_generees.json',{
      headers:{'Authorization':'Bearer '+c.pat,'Accept':'application/vnd.github.v3+json'}
    }).then(function(r){return r.json();}).then(function(d){
      if(!d||!d.sha||!d.content)return;
      var arr=JSON.parse(atob(d.content));
      for(var k=0;k<arr.length;k++){if(arr[k].url===url){
        if(!arr[k].historique)arr[k].historique=[];
        arr[k].historique.push({type:type,date:dt,notes:notes||''});
        if(type==='postule'||type==='relance'||type==='entretien')arr[k].retour=type;
        if(type==='resultat')arr[k].retour=val||'';
        break;
      }}
      var upd=btoa(JSON.stringify(arr,null,2));
      fetch('https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/candidatures_generees.json',{
        method:'PUT',headers:{'Authorization':'Bearer '+c.pat,'Content-Type':'application/json'},
        body:JSON.stringify({message:'Event '+type+' - '+url.substring(0,40),content:upd,sha:d.sha,branch:c.branch})
      }).catch(function(){});
    }).catch(function(){});
  }
}


function genererEmlByUrl(lien){var g=genereesByUrl[lien]||(typeof genereesData!=='undefined'&&genereesData.find(function(x){return x.url===lien}));if(!g)return;if(g.eml_file){var gi=genereesData.indexOf(g);window.open('drafts/'+g.eml_file)}else{if(window.confirm&&confirm('Pas de fichier .eml. Ouvrir le brouillon dans un nouvel onglet ?'))window.open(lien,'_blank')}}
