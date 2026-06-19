(function () {
  var data = window.SITE_SEARCH_ITEMS || [];
  var results = document.querySelector('[data-search-results]');
  var input = document.querySelector('[data-search-input]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  if (input) {
    input.value = initial;
  }
  var render = function (items) {
    results.innerHTML = items.slice(0, 96).map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(item.url) + '">',
        '    <span class="poster-shell"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()"></span>',
        '    <span class="poster-badge">' + escapeHtml(item.region) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  };
  var run = function () {
    var q = (input.value || '').trim().toLowerCase();
    if (!q) {
      render(data.slice(0, 24));
      return;
    }
    var parts = q.split(/\s+/).filter(Boolean);
    var matches = data.filter(function (item) {
      var haystack = [item.title, item.year, item.type, item.region, item.genre, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
      return parts.every(function (part) {
        return haystack.indexOf(part) !== -1;
      });
    });
    render(matches);
  };
  var escapeHtml = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  if (input && results) {
    input.addEventListener('input', run);
    run();
  }
})();
