(function () {
  function readSrc(panel) {
    var node = panel.querySelector('.play-src');

    if (!node) {
      return '';
    }

    try {
      return JSON.parse(node.textContent || '{}').src || '';
    } catch (error) {
      return '';
    }
  }

  function bindPanel(panel) {
    var video = panel.querySelector('.movie-video');
    var layer = panel.querySelector('.play-layer');
    var src = readSrc(panel);
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (video.getAttribute('src') || hlsInstance) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function start() {
      attach();
      panel.classList.add('is-playing');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.watch-panel')).forEach(bindPanel);
})();
