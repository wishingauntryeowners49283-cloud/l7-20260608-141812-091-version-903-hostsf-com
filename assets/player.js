import { H as Hls } from './hls-vendor.js';

function initPlayer(shell) {
    var button = shell.querySelector('.js-play');
    var video = shell.querySelector('video');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.dataset.src;
    var started = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function play() {
        if (!source) {
            setStatus('当前影片暂时无法播放。');
            return;
        }

        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;
        setStatus('正在加载影片…');

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('影片已加载。');
                video.play().catch(function () {
                    setStatus('影片已就绪，请再次点击播放按钮。');
                });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放遇到问题，请刷新页面后重试。');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('影片已加载。');
                video.play().catch(function () {});
            }, { once: true });
        } else {
            setStatus('当前浏览器暂不支持此类视频播放。');
        }

        if (button) {
            button.classList.add('is-hidden');
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-player').forEach(initPlayer);
});
