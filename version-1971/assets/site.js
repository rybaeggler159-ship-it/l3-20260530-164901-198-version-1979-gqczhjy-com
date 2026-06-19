
(function(){
  const videos = document.querySelectorAll('video[data-hls]');
  videos.forEach((video) => {
    const src = video.getAttribute('data-src');
    if (!src) return;
    if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({enableWorker:true, lowLatencyMode:false});
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      const mp4 = video.getAttribute('data-mp4');
      if (mp4) video.src = mp4;
    }
  });

  const hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    const slides = [...hero.querySelectorAll('.slide')];
    const thumbs = [...hero.querySelectorAll('.hero-thumb')];
    if (slides.length > 1) {
      let active = 0;
      const setActive = (idx) => {
        active = idx;
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
      };
      thumbs.forEach((t, i) => t.addEventListener('click', () => setActive(i)));
      setInterval(() => setActive((active + 1) % slides.length), 6000);
      setActive(0);
    }
  }

  const filterRoots = document.querySelectorAll('[data-filter-root]');
  filterRoots.forEach((root) => {
    const input = root.querySelector('[data-filter-input]');
    const selects = root.querySelectorAll('[data-filter-select]');
    const cards = [...root.querySelectorAll('[data-filter-card]')];
    const empty = root.querySelector('[data-filter-empty]');
    const apply = () => {
      const q = (input && input.value || '').trim().toLowerCase();
      const filters = [...selects].map(s => s.value.trim().toLowerCase()).filter(Boolean);
      let visible = 0;
      cards.forEach(card => {
        const text = (card.dataset.search || '').toLowerCase();
        const genre = (card.dataset.genre || '').toLowerCase();
        const year = (card.dataset.year || '').toLowerCase();
        const type = (card.dataset.type || '').toLowerCase();
        const okText = !q || text.includes(q);
        const okFilter = filters.every(f => text.includes(f) || genre.includes(f) || year.includes(f) || type.includes(f));
        const show = okText && okFilter;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : '';
    };
    if (input) input.addEventListener('input', apply);
    selects.forEach(s => s.addEventListener('change', apply));
    apply();
  });
})();
