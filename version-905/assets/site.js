(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.getElementById("mobileNav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupCardFilters() {
        var sections = Array.prototype.slice.call(document.querySelectorAll(".container"));
        sections.forEach(function (section) {
            var grid = section.querySelector("[data-filterable]");
            if (!grid) {
                return;
            }
            var input = section.querySelector(".card-filter-input");
            var region = section.querySelector(".card-filter-region");
            var year = section.querySelector(".card-filter-year");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            function run() {
                var q = normalize(input ? input.value : "");
                var r = normalize(region ? region.value : "");
                var y = normalize(year ? year.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && normalize(card.getAttribute("data-region")) !== r) {
                        ok = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        ok = false;
                    }
                    card.classList.toggle("hidden", !ok);
                });
            }
            [input, region, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", run);
                    el.addEventListener("change", run);
                }
            });
        });
    }

    function cardHTML(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeAttr(movie.title) + '" data-year="' + escapeAttr(movie.year) + '" data-region="' + escapeAttr(movie.region) + '" data-genre="' + escapeAttr(movie.genre) + '" data-tags="' + escapeAttr(movie.tags) + '">',
            '<a class="poster-frame" href="' + escapeAttr(movie.url) + '" aria-label="' + escapeAttr(movie.title) + '">',
            '<img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
            '<span class="play-mark">▶</span>',
            '<span class="type-badge">' + escapeHTML(movie.type) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeAttr(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
            '<p>' + escapeHTML(movie.oneLine) + '</p>',
            '<div class="movie-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.year) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHTML(value);
    }

    function setupGlobalSearch() {
        var input = document.getElementById("globalSearchInput");
        var button = document.getElementById("globalSearchButton");
        var results = document.getElementById("searchResults");
        if (!input || !button || !results || !window.catalogMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
            run();
        }
        function run() {
            var q = normalize(input.value);
            var pool = window.catalogMovies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" "));
                return !q || haystack.indexOf(q) !== -1;
            }).slice(0, 120);
            results.innerHTML = pool.map(cardHTML).join("");
        }
        button.addEventListener("click", run);
        input.addEventListener("input", run);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                run();
            }
        });
    }

    window.initPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("videoOverlay");
        if (!video) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
            video.load();
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("hide");
            }
            var started = video.play();
            if (started && typeof started.catch === "function") {
                started.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hide");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hide");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("hide");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
        attach();
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCardFilters();
        setupGlobalSearch();
    });
})();
