(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var keyword = params.get('q') || '';
  var inputs = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
  var typeFilter = document.querySelector('.type-filter');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var query = normalize(inputs[0] ? inputs[0].value : '');
    var typeValue = normalize(typeFilter ? typeFilter.value : '');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-scope .movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var typeOk = !typeValue || haystack.indexOf(typeValue) !== -1;
      var queryOk = !query || haystack.indexOf(query) !== -1;
      card.hidden = !(typeOk && queryOk);
    });
  }

  inputs.forEach(function (input) {
    if (keyword && !input.value) {
      input.value = keyword;
    }

    input.addEventListener('input', filterCards);
  });

  if (typeFilter) {
    typeFilter.addEventListener('change', filterCards);
  }

  filterCards();
})();
