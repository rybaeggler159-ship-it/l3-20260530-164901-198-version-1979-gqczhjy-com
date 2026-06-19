(() => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const mobile = document.querySelector('[data-mobile-nav]');

    if (toggle && mobile) {
        toggle.addEventListener('click', () => {
            mobile.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        const show = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => show(i));
        });

        if (slides.length > 1) {
            window.setInterval(() => show(index + 1), 5200);
        }
    }

    const homeSearch = document.querySelector('[data-home-search]');

    if (homeSearch) {
        homeSearch.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = homeSearch.querySelector('input');
            const query = input ? input.value.trim() : '';
            const target = query ? `category-all.html?q=${encodeURIComponent(query)}` : 'category-all.html';
            window.location.href = target;
        });
    }

    const grid = document.querySelector('[data-movie-grid]');

    if (grid) {
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const searchInput = document.querySelector('[data-filter-search]');
        const genreSelect = document.querySelector('[data-filter-genre]');
        const sortSelect = document.querySelector('[data-sort]');
        const empty = document.querySelector('[data-empty]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        const apply = () => {
            const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const genre = genreSelect ? genreSelect.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const hay = `${card.dataset.title || ''} ${card.dataset.genre || ''} ${card.dataset.region || ''} ${card.dataset.year || ''} ${card.dataset.category || ''}`.toLowerCase();
                const genreText = `${card.dataset.genre || ''} ${card.dataset.category || ''}`;
                const matchedText = !term || hay.includes(term);
                const matchedGenre = !genre || genreText.includes(genre);
                const ok = matchedText && matchedGenre;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('active', visible === 0);
            }
        };

        const sortCards = () => {
            if (!sortSelect) {
                return;
            }

            const mode = sortSelect.value;
            const sorted = cards.slice().sort((a, b) => {
                if (mode === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (mode === 'year') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
            });

            sorted.forEach((card) => grid.appendChild(card));
            apply();
        };

        cards.forEach((card, i) => {
            card.dataset.index = String(i);
        });

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        if (genreSelect) {
            genreSelect.addEventListener('change', apply);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', sortCards);
        }

        sortCards();
        apply();
    }
})();
