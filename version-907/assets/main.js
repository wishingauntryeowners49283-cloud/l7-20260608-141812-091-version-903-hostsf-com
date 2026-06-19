(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCardFilter() {
        var input = document.querySelector('[data-card-filter]');
        var grid = document.querySelector('[data-filter-grid]');
        var empty = document.querySelector('[data-empty-state]');
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-filter-card'));
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card js-filter-card">',
            '<a href="' + movie.url + '" class="movie-card-link">',
            '<span class="poster-wrap">',
            '<img class="poster-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'poster-img-failed\')">',
            '<span class="poster-shade"></span>',
            '<span class="poster-play">▶</span>',
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '</span>',
            '<span class="movie-card-body">',
            '<span class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span>',
            '<strong>' + escapeHtml(movie.title) + '</strong>',
            '<span class="movie-one-line">' + escapeHtml(movie.oneLine) + '</span>',
            '</span>',
            '</a>',
            '<div class="card-tags"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_DATA) {
            return;
        }
        var keyword = page.querySelector('[data-search-keyword]');
        var region = page.querySelector('[data-search-region]');
        var type = page.querySelector('[data-search-type]');
        var genre = page.querySelector('[data-search-genre]');
        var year = page.querySelector('[data-search-year]');
        var results = page.querySelector('[data-search-results]');
        var empty = page.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (keyword && initial) {
            keyword.value = initial;
        }

        function render() {
            var kw = (keyword.value || '').trim().toLowerCase();
            var selectedRegion = region.value;
            var selectedType = type.value;
            var selectedGenre = genre.value;
            var selectedYear = year.value;
            var matches = window.MOVIE_DATA.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.summary].join(' ').toLowerCase();
                return (!kw || text.indexOf(kw) !== -1)
                    && (!selectedRegion || movie.region === selectedRegion)
                    && (!selectedType || movie.type === selectedType)
                    && (!selectedGenre || movie.genreTerms.indexOf(selectedGenre) !== -1)
                    && (!selectedYear || movie.year === selectedYear);
            }).slice(0, 120);
            results.innerHTML = matches.map(movieCard).join('');
            empty.classList.toggle('show', matches.length === 0);
        }

        [keyword, region, type, genre, year].forEach(function (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        });
        render();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-hls-player'));
        players.forEach(function (video) {
            var url = video.getAttribute('data-hls-url');
            var shell = video.closest('.player-shell');
            var button = shell ? shell.querySelector('[data-player-toggle]') : null;
            var hls = null;

            if (url && window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else if (url && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (url && !video.getAttribute('src')) {
                video.src = url;
            }

            function updateButton() {
                if (button) {
                    button.classList.toggle('is-hidden', !video.paused);
                }
            }

            function togglePlayback(event) {
                if (event) {
                    event.preventDefault();
                }
                if (video.paused) {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                } else {
                    video.pause();
                }
            }

            if (button) {
                button.addEventListener('click', togglePlayback);
            }
            video.addEventListener('click', function (event) {
                if (event.target === video) {
                    togglePlayback(event);
                }
            });
            video.addEventListener('play', updateButton);
            video.addEventListener('pause', updateButton);
            video.addEventListener('ended', updateButton);
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
            updateButton();
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupCardFilter();
        setupSearchPage();
        setupPlayers();
    });
})();
