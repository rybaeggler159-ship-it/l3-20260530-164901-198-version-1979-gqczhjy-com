(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav-links]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var active = 0;
    var show = function (index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5200);
  }

  var scope = document.querySelector('[data-filter-scope]');
  var list = document.querySelector('[data-filter-list]');
  if (scope && list) {
    var keywordInput = scope.querySelector('[data-filter-keyword]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var apply = function () {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var type = typeSelect.value;
      var year = yearSelect.value;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.tags, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !type || card.dataset.type === type;
        var okYear = !year || card.dataset.year === year;
        card.classList.toggle('is-filtered-out', !(okKeyword && okType && okYear));
      });
    };
    keywordInput.addEventListener('input', apply);
    typeSelect.addEventListener('change', apply);
    yearSelect.addEventListener('change', apply);
  }
})();
