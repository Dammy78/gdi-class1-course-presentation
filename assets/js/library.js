(function () {
  const manifest = window.DOC_MANIFEST || { documents: [], categories: {} };
  const listEl = document.getElementById('doc-list-root');
  const searchEl = document.getElementById('doc-search');
  const filtersEl = document.getElementById('cat-filters');
  if (!listEl) return;

  let activeCat = new URLSearchParams(location.search).get('cat') || '';

  function badgeFor(d) { return ''; }

  function render() {
    const q = (searchEl && searchEl.value || '').toLowerCase().trim();
    listEl.innerHTML = '';
    const byCat = {};
    manifest.documents.forEach((d) => {
      if (!d.link_ok) return;
      if (d.classification && d.classification !== 'REGULATORY-PUBLIC') return;

      if (activeCat && d.category !== activeCat) return;
      if (q && !d.title.toLowerCase().includes(q) && !(d.category_label || '').toLowerCase().includes(q)) return;
      (byCat[d.category] = byCat[d.category] || []).push(d);
    });
    const cats = Object.keys(manifest.categories || {}).sort();
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const forceOpen = !!q || !!activeCat;
    cats.forEach((cat) => {
      const items = byCat[cat];
      if (!items || !items.length) return;
      const section = document.createElement('section');
      section.className = 'cat-block';
      const open = forceOpen ? (activeCat ? cat === activeCat : true) : !mobile;
      const details = document.createElement('details');
      details.className = 'cat-details';
      if (open) details.setAttribute('open', '');
      const summary = document.createElement('summary');
      summary.textContent = cat + '. ' + (manifest.categories[cat] || '') + ' (' + items.length + ')';
      details.appendChild(summary);
      const ul = document.createElement('ul');
      ul.className = 'doc-list';
      items.sort((a, b) => a.title.localeCompare(b.title)).forEach((d) => {
        const li = document.createElement('li');
        li.innerHTML =
          '<a href="viewer.html?id=' + encodeURIComponent(d.id) + '">' + d.title + '</a>' + badgeFor(d) +
          '<span class="doc-meta">' + (d.pages ? d.pages + ' pages · ' : '') + d.version + ' · ' + d.classification + '</span>';
        ul.appendChild(li);
      });
      details.appendChild(ul);
      section.appendChild(details);
      listEl.appendChild(section);
    });
    if (!listEl.innerHTML) {
      listEl.innerHTML = '<p>No documents match your search or filter.</p>';
    }
  }

  if (filtersEl) {
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.textContent = 'All categories';
    allBtn.className = activeCat ? '' : 'active';
    allBtn.addEventListener('click', function () { activeCat = ''; filtersEl.querySelectorAll('button').forEach(b => b.classList.remove('active')); allBtn.classList.add('active'); render(); });
    filtersEl.appendChild(allBtn);
    Object.keys(manifest.categories || {}).sort().forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat;
      if (cat === activeCat) btn.className = 'active';
      btn.addEventListener('click', function () {
        activeCat = cat;
        filtersEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
      filtersEl.appendChild(btn);
    });
  }

  searchEl && searchEl.addEventListener('input', render);
  render();
})();
