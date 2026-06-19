(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('site-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function() {
                setHero(activeIndex + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        setHero(0);
        restartHero();
    }

    if (prev) {
        prev.addEventListener('click', function() {
            setHero(activeIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            setHero(activeIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            setHero(index);
            restartHero();
        });
    });

    var filterBox = document.querySelector('[data-card-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-cards] .movie-card'));

    function filterCards() {
        var query = filterBox ? filterBox.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';

        cards.forEach(function(card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var matchesType = !type || card.getAttribute('data-type') === type;

            card.style.display = matchesQuery && matchesYear && matchesType ? '' : 'none';
        });
    }

    [filterBox, yearFilter, typeFilter].forEach(function(control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    var searchMount = document.querySelector('[data-search-results]');

    if (searchMount && window.movieSearchData) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var initialCategory = params.get('category') || '';
        var searchInput = document.querySelector('[data-search-input]');
        var categoryInput = document.querySelector('[data-search-category]');

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        if (categoryInput) {
            categoryInput.value = initialCategory;
        }

        function renderSearch() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categoryInput ? categoryInput.value : '';
            var results = window.movieSearchData.filter(function(item) {
                var haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.category].join(' ').toLowerCase();
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var categoryMatch = !category || item.category === category;
                return queryMatch && categoryMatch;
            });

            if (!results.length) {
                searchMount.innerHTML = '<div class="empty-results">没有找到匹配内容，可以尝试更换片名、年份、地区或类型。</div>';
                return;
            }

            searchMount.innerHTML = '<div class="movie-grid">' + results.map(function(item) {
                return '<article class="movie-card">' +
                    '<a class="movie-cover" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 高清封面" loading="lazy">' +
                    '<span class="movie-year">' + escapeHtml(item.year) + '</span>' +
                    '</a>' +
                    '<div class="movie-info">' +
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('') + '</div>';
        }

        function escapeHtml(text) {
            return String(text || '').replace(/[&<>"']/g, function(character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', renderSearch);
        }

        if (categoryInput) {
            categoryInput.addEventListener('change', renderSearch);
        }

        renderSearch();
    }
})();
