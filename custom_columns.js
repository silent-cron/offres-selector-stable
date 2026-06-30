// Columnes Date/Retour/Historique - fichier autonome
(function() {
  var checkExist = setInterval(function() {
    if (typeof renderDashboard !== 'undefined' && typeof genereesData !== 'undefined') {
      clearInterval(checkExist);
      setupColumns();
    }
  }, 200);

  function setupColumns() {
    var origRender = renderDashboard;
    renderDashboard = function() {
      origRender();
      setTimeout(addDateRetourHistColumns, 50);
    };

    function addDateRetourHistColumns() {
      var table = document.getElementById('gen-table');
      if (!table) return;
      var thead = table.querySelector('thead tr');
      var tbody = table.querySelector('tbody');
      if (!thead || !tbody) return;
      if (thead.querySelector('th[data-col="date"]')) return;

      var hDate = document.createElement('th');
      hDate.setAttribute('data-col','date');
      hDate.style.cssText = 'padding:9px 8px;text-align:center;width:100px;';
      hDate.textContent = '📅 Date';
      thead.appendChild(hDate);

      var hRetour = document.createElement('th');
      hRetour.setAttribute('data-col','retour');
      hRetour.style.cssText = 'padding:9px 8px;text-align:center;width:120px;';
      hRetour.textContent = '✅ Retour';
      thead.appendChild(hRetour);

      var hHist = document.createElement('th');
      hHist.setAttribute('data-col','hist');
      hHist.style.cssText = 'padding:9px 8px;text-align:center;width:70px;';
      hHist.textContent = '📋 Hist.';
      thead.appendChild(hHist);

      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function(row) {
        var url = getRowUrl(row);
        if (!url) return;
        var g = genereesByUrl && genereesByUrl[url];
        var safeUrl = url.replace(/[^a-zA-Z0-9]/g,'');

        var tdDate = document.createElement('td');
        tdDate.style.cssText = 'padding:8px;text-align:center;';
        var inpDate = document.createElement('input');
        inpDate.type = 'date';
        inpDate.className = 'dch-'+safeUrl;
        inpDate.style.cssText = 'font-size:0.72rem;padding:2px;border:1px solid #ddd;border-radius:4px;width:100px;';
        var dateVal = g && (g.date_candidature || '');
        if (dateVal) {
          var m = dateVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          inpDate.value = m ? m[3]+'-'+m[2]+'-'+m[1] : dateVal;
        }
        inpDate.onchange = function() { updateDate(url, this.value); };
        tdDate.appendChild(inpDate);
        row.appendChild(tdDate);

        var tdRetour = document.createElement('td');
        tdRetour.style.cssText = 'padding:8px;text-align:center;';
        var sel = document.createElement('select');
        sel.style.cssText = 'font-size:0.72rem;padding:2px 4px;border:1px solid #ddd;border-radius:4px;';
        var options = [
          {val:'', txt:'—'}, {val:'postule', txt:'📋 Postulé'},
          {val:'positif', txt:'✅ Positif'}, {val:'negatif', txt:'❌ Négatif'},
          {val:'entretien', txt:'📞 Entretien'}, {val:'relance', txt:'📬 Relancé'},
          {val:'pas_de_reponse', txt:'🤷 Pas de réponse'}
        ];
        options.forEach(function(o) {
          var opt = document.createElement('option');
          opt.value = o.val;
          if (g && g.retour === o.val) opt.selected = true;
          opt.textContent = o.txt;
          sel.appendChild(opt);
        });
        sel.onchange = function() { updateRetour(url, this.value); };
        tdRetour.appendChild(sel);
        row.appendChild(tdRetour);

        var tdHist = document.createElement('td');
        tdHist.style.cssText = 'padding:8px;text-align:center;';
        var btn = document.createElement('button');
        btn.textContent = '📋';
        btn.title = 'Historique';
        btn.style.cssText = 'background:#8b5cf6;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:0.72rem;cursor:pointer;';
        btn.onclick = function() {
          if (typeof showHistorique === 'function') showHistorique(url);
        };
        tdHist.appendChild(btn);
        row.appendChild(tdHist);
      });
    }

    function getRowUrl(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 2) return '';
      var link = cells[1].querySelector('a');
      return link ? link.getAttribute('href') || '' : '';
    }
  }
})();
