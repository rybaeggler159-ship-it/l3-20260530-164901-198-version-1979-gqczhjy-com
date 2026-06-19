const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
    });
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function updateSearch(container) {
    const cards = Array.from(container.querySelectorAll('[data-movie-card]'));
    const input = container.querySelector('[data-search-input]');
    const result = container.querySelector('[data-result-count]');
    const empty = container.querySelector('[data-empty-state]');
    const query = normalizeText(input ? input.value : '');
    let visible = 0;

    cards.forEach((card) => {
        const haystack = normalizeText(card.dataset.search);
        const matched = !query || haystack.includes(query);
        card.style.display = matched ? '' : 'none';
        if (matched) {
            visible += 1;
        }
    });

    if (result) {
        result.textContent = `${visible} 部影片`;
    }

    if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
    }
}

function sortCards(container) {
    const select = container.querySelector('[data-sort-select]');
    const grid = container.querySelector('[data-card-grid]');

    if (!select || !grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    const value = select.value;

    cards.sort((a, b) => {
        if (value === 'year') {
            return Number(b.dataset.year) - Number(a.dataset.year);
        }
        if (value === 'score') {
            return Number(b.dataset.score) - Number(a.dataset.score);
        }
        if (value === 'title') {
            return normalizeText(a.dataset.search).localeCompare(normalizeText(b.dataset.search), 'zh-CN');
        }
        return 0;
    });

    cards.forEach((card) => grid.appendChild(card));
}

function initSearchPanels() {
    document.querySelectorAll('[data-search-panel]').forEach((container) => {
        const input = container.querySelector('[data-search-input]');
        const select = container.querySelector('[data-sort-select]');

        if (input) {
            input.addEventListener('input', () => updateSearch(container));
        }

        if (select) {
            select.addEventListener('change', () => {
                sortCards(container);
                updateSearch(container);
            });
        }

        updateSearch(container);
    });
}

function initHero() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
        return;
    }

    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => show(index));
    });

    show(0);

    if (slides.length > 1) {
        window.setInterval(() => show(current + 1), 5200);
    }
}

export function initMoviePlayer(options) {
    const video = document.getElementById('moviePlayer');
    const overlay = document.getElementById('playOverlay');

    if (!video || !overlay || !options || !options.source) {
        return;
    }

    let loaded = false;
    let hlsInstance = null;

    function attachSource() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = options.source;
        } else if (options.Hls && options.Hls.isSupported()) {
            hlsInstance = new options.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(options.source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = options.source;
        }
    }

    function startPlayback() {
        attachSource();
        overlay.classList.add('is-hidden');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', () => overlay.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
        if (!video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
    video.addEventListener('ended', () => overlay.classList.remove('is-hidden'));

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

initSearchPanels();
initHero();
