(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalise(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
        inputs.forEach(function (input) {
            var scope = input.closest('main') || document;
            var list = scope.querySelector('[data-filter-list]');
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
            var counter = scope.querySelector('[data-filter-count]');
            var empty = null;

            if (!list || !cards.length) {
                return;
            }

            function ensureEmpty() {
                if (!empty) {
                    empty = document.createElement('div');
                    empty.className = 'no-results';
                    empty.textContent = '没有匹配的影片，请换一个关键词。';
                    list.appendChild(empty);
                }
                return empty;
            }

            function filter() {
                var query = normalise(input.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalise([
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.genre,
                        card.dataset.year,
                        card.dataset.region,
                        card.textContent
                    ].join(' '));
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        shown += 1;
                    }
                });

                if (counter) {
                    counter.textContent = query ? '匹配 ' + shown + ' 部' : '共 ' + cards.length + ' 部';
                }

                if (shown === 0) {
                    ensureEmpty().style.display = '';
                } else if (empty) {
                    empty.style.display = 'none';
                }
            }

            input.addEventListener('input', filter);

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            filter();
        });
    }

    function initNavSearchShortcut() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.nav-search, .large-search'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function () {
                var input = form.querySelector('input[name="q"]');
                if (input) {
                    input.value = input.value.trim();
                }
            });
        });
    }

    ready(function () {
        initHero();
        initFilters();
        initNavSearchShortcut();
    });
}());
