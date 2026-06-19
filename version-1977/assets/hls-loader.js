(function () {
  if (window.Hls) {
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
  script.async = true;
  document.head.appendChild(script);
})();
