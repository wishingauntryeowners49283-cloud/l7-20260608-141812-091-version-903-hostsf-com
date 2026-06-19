var MoviePlayer = (function() {
    function mount(config) {
        var video = document.getElementById(config.videoId);
        var layer = document.getElementById(config.layerId);
        var url = config.url;
        var ready = false;
        var hls = null;

        if (!video || !url) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }

            video.src = url;
        }

        function start() {
            attach();

            if (layer) {
                layer.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {});
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function() {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function() {
            if (layer) {
                layer.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    return {
        mount: mount
    };
})();
