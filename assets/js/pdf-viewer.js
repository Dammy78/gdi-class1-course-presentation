(function () {
  const manifest = window.DOC_MANIFEST || { documents: [] };
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const doc = manifest.documents.find((d) => d.id === id);
  const titleEl = document.getElementById('viewer-title');
  const metaEl = document.getElementById('viewer-meta');
  const statusEl = document.getElementById('viewer-status');
  const canvas = document.getElementById('pdf-canvas');
  const wrap = document.getElementById('pdf-canvas-wrap');
  const dl = document.getElementById('download-link');
  if (!doc || !doc.link_ok || doc.classification !== 'REGULATORY-PUBLIC') {
    if (titleEl) titleEl.textContent = 'Document not found';
    return;
  }
  titleEl.textContent = doc.title;
  metaEl.textContent = (doc.category_label || '') + ' · ' + doc.version + ' · ' + doc.classification +
    (doc.pages ? ' · ' + doc.pages + ' pages' : '');
  if (dl) {
    if (doc.download_allowed) {
      dl.href = doc.viewer_path;
      dl.download = doc.title;
      dl.style.display = '';
    } else {
      dl.style.display = 'none';
    }
  }
  const pdfUrl = doc.viewer_path;
  let pdfDoc = null;
  let pageNum = 1;
  let scale = 1.2;

  function renderPage() {
    statusEl.textContent = 'Rendering page ' + pageNum + ' of ' + pdfDoc.numPages + '…';
    pdfDoc.getPage(pageNum).then(function (page) {
      const viewport = page.getViewport({ scale: scale });
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        statusEl.textContent = 'Page ' + pageNum + ' of ' + pdfDoc.numPages;
      });
    });
  }

  document.getElementById('prev-page')?.addEventListener('click', function () {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage();
  });
  document.getElementById('next-page')?.addEventListener('click', function () {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage();
  });
  document.getElementById('zoom-in')?.addEventListener('click', function () {
    scale += 0.15;
    renderPage();
  });
  document.getElementById('zoom-out')?.addEventListener('click', function () {
    scale = Math.max(0.5, scale - 0.15);
    renderPage();
  });

  const related = manifest.documents.filter((d) => d.category === doc.category && d.id !== doc.id && d.link_ok).slice(0, 5);
  const relEl = document.getElementById('related-docs');
  if (relEl && related.length) {
    relEl.innerHTML = '<h3>Related in this category</h3><ul>' +
      related.map((r) => '<li><a href="viewer.html?id=' + encodeURIComponent(r.id) + '">' + r.title + '</a></li>').join('') +
      '</ul>';
  }

  if (!window['pdfjsLib']) {
    statusEl.textContent = 'PDF.js failed to load.';
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
    pdfDoc = pdf;
    renderPage();
  }).catch(function (err) {
    statusEl.textContent = 'Error loading PDF: ' + err.message;
  });
})();
