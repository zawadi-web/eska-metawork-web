/* ESKA METALWORKS – gallery.js
 * Loads project images from data/gallery.json and powers the gallery filter UI.
 * Videos use a custom fullscreen modal (GLightbox does not reliably handle local mp4).
 */

(function () {
  'use strict';

  /* ── GLightbox init (images only) ───────────────────────── */
  let lightboxInstance = null;
  function initLightbox() {
    if (typeof GLightbox === 'undefined') return;
    if (lightboxInstance) lightboxInstance.destroy();
    lightboxInstance = GLightbox({
      selector: '.glightbox-img',
      touchNavigation: true,
      loop: true,
      openEffect: 'zoom',
      closeEffect: 'fade',
    });
  }
  initLightbox();

  /* ── Custom Video Modal ──────────────────────────────────── */
  function openVideoModal(src, title) {
    const existing = document.getElementById('eska-video-modal');
    if (existing) existing.remove();

    // Build absolute URL so the modal works from any page
    const absoluteSrc = new URL(src, window.location.href).href;

    const overlay = document.createElement('div');
    overlay.id = 'eska-video-modal';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:rgba(0,0,0,0.95)',
      'display:flex', 'flex-direction:column',
      'align-items:center', 'justify-content:center',
      'padding:20px', 'box-sizing:border-box',
      'animation:eskaFadeIn 0.25s ease'
    ].join(';');

    if (!document.getElementById('eska-modal-style')) {
      const s = document.createElement('style');
      s.id = 'eska-modal-style';
      s.textContent = '@keyframes eskaFadeIn{from{opacity:0}to{opacity:1}} @keyframes eskaSpin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Close (Esc)';
    closeBtn.style.cssText = [
      'position:absolute', 'top:16px', 'right:20px',
      'background:rgba(255,255,255,0.1)', 'border:none',
      'color:#fff', 'font-size:2.2rem', 'line-height:1',
      'width:44px', 'height:44px', 'border-radius:50%',
      'cursor:pointer', 'display:flex', 'align-items:center',
      'justify-content:center', 'transition:background 0.2s'
    ].join(';');
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.25)';
    closeBtn.onmouseout  = () => closeBtn.style.background = 'rgba(255,255,255,0.1)';

    const titleEl = document.createElement('p');
    titleEl.textContent = title || '';
    titleEl.style.cssText = [
      'color:#fff', 'font-size:1rem', 'font-weight:600',
      'margin:0 0 14px', 'text-align:center',
      'max-width:90vw', 'opacity:0.85', 'letter-spacing:0.02em'
    ].join(';');

    // Loading spinner (auto-hidden after 2s regardless)
    const spinner = document.createElement('div');
    spinner.style.cssText = [
      'width:48px', 'height:48px', 'border:4px solid rgba(255,255,255,0.2)',
      'border-top-color:#ff6a00', 'border-radius:50%',
      'animation:eskaSpin 0.8s linear infinite',
      'position:absolute'
    ].join(';');

    // Use <video> + <source type="video/mp4"> for reliable MIME detection
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.cssText = [
      'max-width:92vw', 'max-height:78vh',
      'border-radius:10px', 'background:#000',
      'box-shadow:0 8px 40px rgba(0,0,0,0.7)',
      'outline:none'
    ].join(';');

    // Use <source> so browser gets MIME type without relying on server header
    const source = document.createElement('source');
    source.src  = absoluteSrc;
    source.type = 'video/mp4';
    video.appendChild(source);

    let spinnerTimeout = null;
    const hideSpinner = () => {
      if (spinnerTimeout) clearTimeout(spinnerTimeout);
      spinner.style.display = 'none';
    };
    video.addEventListener('playing', hideSpinner, { once: true });
    video.addEventListener('loadeddata', hideSpinner, { once: true });
    spinnerTimeout = setTimeout(hideSpinner, 2000);

    // Show error if video completely fails
    video.addEventListener('error', () => {
      if (spinnerTimeout) clearTimeout(spinnerTimeout);
      spinner.innerHTML = '<span style="color:#ff6a00;font-size:0.85rem;text-align:center;max-width:280px;display:block;">Could not play video.<br>Try opening it directly.</span>';
      spinner.style.cssText = 'position:absolute;display:flex;align-items:center;justify-content:center;';
    });
    source.addEventListener('error', () => {
      video.dispatchEvent(new Event('error'));
    });

    const close = () => {
      video.pause();
      source.src = '';
      video.load(); // abort any pending network request
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // WhatsApp absolute query link
    const waText = `Hello ESKA Metalworks, I am interested in this video project: "${title || 'Metalwork'}" (${absoluteSrc})`;
    const waLink = `https://wa.me/254708433265?text=${encodeURIComponent(waText)}`;

    const waBtn = document.createElement('a');
    waBtn.href = waLink;
    waBtn.target = '_blank';
    waBtn.innerHTML = '<i class="fab fa-whatsapp" style="margin-right:6px;"></i> Inquire on WhatsApp';
    waBtn.style.cssText = [
      'margin-top:14px', 'background:#25D366', 'color:#fff',
      'padding:10px 22px', 'border-radius:30px', 'text-decoration:none',
      'font-weight:600', 'font-size:0.9rem', 'display:flex',
      'align-items:center', 'justify-content:center',
      'box-shadow:0 4px 15px rgba(37,211,102,0.3)', 'transition:transform 0.2s, background 0.2s'
    ].join(';');
    waBtn.onmouseover = () => { waBtn.style.transform = 'scale(1.05)'; waBtn.style.background = '#128c7e'; };
    waBtn.onmouseout = () => { waBtn.style.transform = 'scale(1)'; waBtn.style.background = '#25D366'; };

    overlay.appendChild(closeBtn);
    if (title) overlay.appendChild(titleEl);
    overlay.appendChild(spinner);
    overlay.appendChild(video);
    overlay.appendChild(waBtn);
    document.body.appendChild(overlay);

    // Give DOM time to render then attempt play
    setTimeout(() => {
      const p = video.play();
      if (p && p.catch) p.catch(() => {
        // Autoplay blocked – controls visible so user can press play manually
        hideSpinner();
      });
    }, 100);
  }

  /* ── Filter tabs ────────────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.gallery-filter');
  const galleryGrid = document.getElementById('gallery-grid');
  const emptyState  = document.getElementById('gallery-empty');

  function applyFilter(category) {
    let visible = 0;
    if (!galleryGrid) return;
    galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
      const cat  = item.dataset.category || '';
      const show = (category === 'all' || cat === category);
      item.hidden = !show;
      if (show) visible++;
    });
    if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter || 'all');
    });
  });

  /* ── Load project images from gallery.json ─────────────── */
  const dynContainer = document.getElementById('gallery-dynamic') || galleryGrid;
  if (dynContainer) {
    // Check if category is passed in URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('category');
    if (urlCat) {
      const matchBtn = document.querySelector(`.gallery-filter[data-filter="${urlCat}"]`);
      if (matchBtn) {
        filterBtns.forEach(b => b.classList.remove('active'));
        matchBtn.classList.add('active');
      }
    }

    fetch('data/gallery.json?' + Date.now())
      .then(r => r.json())
      .then(data => {
        const images = data.images || [];
        if (!images.length) return;

        const activeFilter  = document.querySelector('.gallery-filter.active');
        const currentFilter = activeFilter ? (activeFilter.dataset.filter || 'all') : 'all';
        const baseUrl       = window.location.href;

        images.forEach(img => {
          if (!img || !img.file) return;
          const isVideo = img.file.toLowerCase().endsWith('.mp4');
          const item    = document.createElement(isVideo ? 'div' : 'a');
          const fileUrl = new URL(img.file, baseUrl);
          const absoluteFileUrl = fileUrl.href;
          const waText = `Hello ESKA Metalworks, I am interested in this project: "${img.title || 'Metalwork'}" (${absoluteFileUrl})`;
          const waLink = `https://wa.me/254708433265?text=${encodeURIComponent(waText)}`;

          if (!isVideo) {
            const linkUrl = new URL(img.file, baseUrl);
            linkUrl.searchParams.set('v', Date.now());
            item.href            = linkUrl.href;
            item.className       = 'gallery-item glightbox-img';
            item.dataset.gallery = 'eska-gallery';
            item.dataset.description = `${img.title || ''} <br><a href="${waLink}" target="_blank" style="color:#ff6a00;text-decoration:none;font-weight:600;margin-top:6px;display:inline-block;"><i class="fab fa-whatsapp" style="margin-right:4px;"></i> Inquire on WhatsApp</a>`;
          } else {
            item.className = 'gallery-item gallery-item--video';
            item.style.cursor = 'pointer';

            /* ── Hover preview: smooth play/pause ── */
            let hoverTimer = null;
            item.addEventListener('mouseenter', function () {
              const v = this.querySelector('video');
              if (!v) return;
              if (v.preload === 'none') v.preload = 'auto';
              hoverTimer = setTimeout(() => {
                v.play().catch(() => {});
                const icon = this.querySelector('.vplay-icon');
                if (icon) icon.style.opacity = '0';
              }, 120);
            });
            item.addEventListener('mouseleave', function () {
              clearTimeout(hoverTimer);
              const v = this.querySelector('video');
              if (!v) return;
              v.pause();
              v.currentTime = 0;
              const icon = this.querySelector('.vplay-icon');
              if (icon) icon.style.opacity = '1';
            });

            /* ── Click: open fullscreen modal ── */
            item.addEventListener('click', () => openVideoModal(img.file, img.title));
          }

          item.dataset.category = img.category || 'custom';
          if (currentFilter !== 'all' && img.category !== currentFilter) {
            item.hidden = true;
          }

          /* ── Build inner HTML ── */
          let inner = '';
          if (isVideo) {
            inner = `
              <video src="${escHtml(img.file)}" muted loop playsinline preload="none"
                style="width:100%;height:100%;object-fit:cover;display:block;background:#000;transition:transform 0.5s ease;"></video>
              <div class="vplay-icon" style="
                position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                width:54px;height:54px;border-radius:50%;
                background:rgba(0,0,0,0.62);backdrop-filter:blur(4px);
                display:flex;align-items:center;justify-content:center;
                color:#fff;font-size:1.4rem;pointer-events:none;
                transition:opacity 0.25s ease;z-index:3;">
                <i class="fas fa-play" style="margin-left:3px;"></i>
              </div>
              <div style="position:absolute;top:10px;right:10px;
                background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
                color:#fff;padding:3px 8px;border-radius:20px;
                font-size:0.72rem;font-weight:600;letter-spacing:0.05em;
                pointer-events:none;z-index:3;">
                <i class="fas fa-video" style="margin-right:4px;"></i>VIDEO
              </div>`;
          } else {
            inner = `<img src="${escHtml(img.file)}?v=${Date.now()}" alt="${escHtml(img.title || '')}" loading="lazy">`;
          }

          item.innerHTML = `
            ${inner}
            <div class="gallery-item__overlay" style="z-index:10;">
              <i class="fas ${isVideo ? 'fa-play-circle' : 'fa-expand'}"></i>
              <span class="gallery-item__cat">${escHtml(formatCat(img.category))}</span>
              <span class="gallery-item__title">${escHtml(img.title || 'Project')}</span>
              <a href="${waLink}" target="_blank" class="gallery-item__wa-btn" style="
                margin-top:12px;background:#25D366;color:#fff;
                padding:6px 14px;border-radius:20px;font-size:0.75rem;
                font-weight:600;text-decoration:none;display:inline-flex;
                align-items:center;gap:4px;z-index:20;
                transition:background 0.2s, transform 0.2s;" 
                onclick="event.stopPropagation();"
                onmouseover="this.style.background='#128c7e'; this.style.transform='scale(1.05)';"
                onmouseout="this.style.background='#25D366'; this.style.transform='scale(1)';">
                <i class="fab fa-whatsapp"></i> Inquire on WhatsApp
              </a>
            </div>`;

          dynContainer.appendChild(item);
        });

        // Re-init GLightbox for the newly added image anchors
        initLightbox();
      })
      .catch(err => {
        console.error('[ESKA Gallery] Failed to load gallery.json:', err);
      });
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatCat(cat) {
    const map = {
      gates:   'Gates & Automation',
      doors:   'Doors & Entries',
      windows: 'Windows & Grilles',
      shades:  'Carshades & Pergolas',
      towers:  'Tank Towers',
      custom:  'Railings & Custom',
    };
    return map[cat] || cat;
  }

})();
