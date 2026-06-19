(function () {
  var waitForHls = function (callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (window.Hls || tries > 60) {
        clearInterval(timer);
        callback(window.Hls || null);
      }
    }, 100);
  };

  var startPlayer = function (box) {
    if (box.dataset.ready === '1') {
      var current = box.querySelector('video');
      current.play().catch(function () {});
      return;
    }
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }
    box.dataset.ready = '1';
    if (button) {
      button.classList.add('is-hidden');
    }
    var playNow = function () {
      video.play().catch(function () {});
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playNow, { once: true });
      video.load();
      playNow();
      return;
    }
    waitForHls(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playNow);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
          if (data && data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
        });
        box._hls = hls;
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', playNow, { once: true });
        video.load();
        playNow();
      }
    });
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var button = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        startPlayer(box);
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
