(function () {
    var hlsLoader = null;

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            toggle.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var root = document.querySelector('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var mini = Array.prototype.slice.call(root.querySelectorAll('.hero-mini'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
            mini.forEach(function (item, i) {
                item.classList.toggle('active', i === index);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.concat(mini).forEach(function (control) {
            control.addEventListener('click', function (event) {
                if (control.classList.contains('hero-mini')) {
                    event.preventDefault();
                }
                var target = Number(control.getAttribute('data-target'));
                if (!Number.isNaN(target)) {
                    show(target);
                    schedule();
                }
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        schedule();
    }

    function textOf(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupPageFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('.page-filter-input');
            var grid = scope.nextElementSibling;
            if (!input || !grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            input.addEventListener('input', function () {
                var query = textOf(input.value);
                cards.forEach(function (card) {
                    var content = textOf(card.getAttribute('data-search'));
                    card.classList.toggle('is-hidden', query && content.indexOf(query) === -1);
                });
            });
        });
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var input = page.querySelector('.site-search-input');
        var selects = Array.prototype.slice.call(page.querySelectorAll('.site-select'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.search-results .movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input && initial) {
            input.value = initial;
        }

        function matches(card) {
            var query = input ? textOf(input.value) : '';
            var content = textOf(card.getAttribute('data-search'));
            if (query && content.indexOf(query) === -1) {
                return false;
            }
            return selects.every(function (select) {
                var value = textOf(select.value);
                if (!value) {
                    return true;
                }
                var field = select.getAttribute('data-filter');
                return textOf(card.getAttribute('data-' + field)).indexOf(value) !== -1;
            });
        }

        function filter() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matches(card));
            });
        }

        if (input) {
            input.addEventListener('input', filter);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', filter);
        });
        filter();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        if (!hlsLoader) {
            hlsLoader = document.createElement('script');
            hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            hlsLoader.async = true;
            document.head.appendChild(hlsLoader);
        }
        hlsLoader.addEventListener('load', callback, { once: true });
    }

    function setupPlayers() {
        document.querySelectorAll('.js-player').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.js-play-button');
            var src = player.getAttribute('data-video-src');
            var attached = false;
            var hlsInstance = null;

            function attachThenPlay() {
                if (!video || !src) {
                    return;
                }
                function playNow() {
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {});
                    }
                    player.classList.add('is-playing');
                }
                if (attached) {
                    playNow();
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    attached = true;
                    playNow();
                    return;
                }
                loadHls(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        attached = true;
                        video.addEventListener('canplay', playNow, { once: true });
                        window.setTimeout(playNow, 500);
                    } else {
                        video.src = src;
                        attached = true;
                        playNow();
                    }
                });
            }

            if (button) {
                button.addEventListener('click', attachThenPlay);
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        player.classList.remove('is-playing');
                    }
                });
                video.addEventListener('ended', function () {
                    player.classList.remove('is-playing');
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupPageFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
