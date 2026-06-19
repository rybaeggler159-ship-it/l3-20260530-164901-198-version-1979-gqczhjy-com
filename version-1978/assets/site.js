const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = $('[data-menu-toggle]');
  const panel = $('[data-menu-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
  });
}

function initHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  let items = [];

  try {
    items = JSON.parse(hero.getAttribute('data-hero-items') || '[]');
  } catch (error) {
    items = [];
  }

  if (items.length <= 1) {
    return;
  }

  const image = $('[data-hero-image]', hero);
  const title = $('[data-hero-title]', hero);
  const summary = $('[data-hero-summary]', hero);
  const meta = $('[data-hero-meta]', hero);
  const watch = $('[data-hero-watch]', hero);
  const category = $('[data-hero-category]', hero);
  let index = 0;

  const render = () => {
    const item = items[index % items.length];

    if (image) {
      image.src = item.cover;
      image.alt = item.title;
      image.classList.remove('image-missing');
    }

    if (title) {
      title.textContent = item.title;
    }

    if (summary) {
      summary.textContent = item.oneLine;
    }

    if (meta) {
      meta.textContent = item.meta;
    }

    if (watch) {
      watch.href = item.url;
    }

    if (category) {
      category.href = item.categoryUrl;
      category.textContent = item.categoryName ? `探索${item.categoryName}` : '探索更多';
    }
  };

  window.setInterval(() => {
    index += 1;
    render();
  }, 5200);
}

function initLocalFilters() {
  const panel = $('[data-filter-panel]');

  if (!panel) {
    return;
  }

  const cards = $$('[data-search-card]');
  const input = $('[data-local-search]', panel);
  const empty = $('[data-filter-empty]');
  const state = {
    year: '',
    region: '',
    category: '',
    query: ''
  };

  const setActive = (selector, value) => {
    $$(selector, panel).forEach((button) => {
      button.classList.toggle('active', (button.dataset.filterYear || button.dataset.filterRegion || button.dataset.filterCategory || '') === value);
    });
  };

  const apply = () => {
    let visible = 0;
    const query = state.query.trim().toLowerCase();

    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.year || ''} ${card.dataset.tags || ''}`.toLowerCase();
      const matched = (!query || haystack.includes(query)) &&
        (!state.year || card.dataset.year === state.year) &&
        (!state.region || card.dataset.region === state.region) &&
        (!state.category || card.dataset.category === state.category);

      card.classList.toggle('is-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  panel.addEventListener('click', (event) => {
    const yearButton = event.target.closest('[data-filter-year]');
    const regionButton = event.target.closest('[data-filter-region]');
    const categoryButton = event.target.closest('[data-filter-category]');
    const resetButton = event.target.closest('[data-filter-reset]');

    if (yearButton) {
      state.year = yearButton.dataset.filterYear || '';
      setActive('[data-filter-year]', state.year);
      apply();
    }

    if (regionButton) {
      state.region = regionButton.dataset.filterRegion || '';
      setActive('[data-filter-region]', state.region);
      apply();
    }

    if (categoryButton) {
      state.category = categoryButton.dataset.filterCategory || '';
      setActive('[data-filter-category]', state.category);
      apply();
    }

    if (resetButton) {
      state.year = '';
      state.region = '';
      state.category = '';
      state.query = '';

      if (input) {
        input.value = '';
      }

      setActive('[data-filter-year]', '');
      setActive('[data-filter-region]', '');
      setActive('[data-filter-category]', '');
      apply();
    }
  });

  if (input) {
    input.addEventListener('input', () => {
      state.query = input.value;
      apply();
    });
  }
}

async function prepareHls(video) {
  const source = video.dataset.src;

  if (!source || video.dataset.ready === '1') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = '1';
    return;
  }

  try {
    const module = await import('./video-vendor-dru42stk.js');
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.dataset.ready = '1';
      return;
    }
  } catch (error) {
    console.warn('HLS 初始化失败，尝试使用浏览器原生播放。', error);
  }

  video.src = source;
  video.dataset.ready = '1';
}

function initPlayers() {
  $$('[data-player-shell]').forEach((shell) => {
    const video = $('.js-hls-player', shell);
    const button = $('[data-player-play]', shell);

    if (!video || !button) {
      return;
    }

    prepareHls(video);

    const play = async () => {
      button.querySelector('small').textContent = '正在加载播放源...';

      try {
        await prepareHls(video);
        video.controls = true;
        button.hidden = true;
        await video.play();
      } catch (error) {
        button.hidden = false;
        button.querySelector('small').textContent = '播放失败，请刷新页面或更换浏览器后重试。';
        console.error(error);
      }
    };

    button.addEventListener('click', play);
    shell.addEventListener('dblclick', play);
  });
}

function movieCardTemplate(item) {
  const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
    <article class="movie-card" data-search-card>
      <a class="poster-frame" href="${escapeHtml(item.url)}" aria-label="观看 ${escapeHtml(item.title)}">
        <img src="./${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.classList.add('image-missing')">
        <span class="poster-play">▶</span>
      </a>
      <div class="movie-card-body">
        <div class="meta-line"><span>${escapeHtml(item.region)}</span><span>${escapeHtml(item.type)}</span><span>${escapeHtml(item.year)}</span></div>
        <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.oneLine || '')}</p>
        <div class="tag-list">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char]);
}

function initSearchPage() {
  const results = $('[data-search-results]');

  if (!results || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const title = $('[data-search-title]');
  const empty = $('[data-search-empty]');
  const input = $('[data-global-search-input]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (input) {
    input.value = initialQuery;
  }

  const render = (query) => {
    const normalized = query.trim().toLowerCase();
    const pool = window.MOVIE_SEARCH_INDEX;
    const matched = normalized
      ? pool.filter((item) => `${item.title} ${item.region} ${item.year} ${item.genre} ${(item.tags || []).join(' ')}`.toLowerCase().includes(normalized))
      : pool.slice(0, 80);

    results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join('');

    if (title) {
      title.textContent = normalized ? `“${query}” 的搜索结果（${matched.length}）` : '推荐影片';
    }

    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  };

  render(initialQuery);

  if (input) {
    input.addEventListener('input', () => render(input.value));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHero();
  initLocalFilters();
  initPlayers();
  initSearchPage();
});
