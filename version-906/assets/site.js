(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function restart(index) {
            window.clearInterval(timer);
            show(index);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                restart(index);
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });

        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var root = panel.parentElement;
            if (!root) {
                return;
            }
            var input = panel.querySelector("[data-search-input]");
            var typeSelect = panel.querySelector("[data-type-filter]");
            var yearSelect = panel.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var noResult = root.querySelector("[data-no-result]");
            if (!cards.length) {
                return;
            }

            function addOptions(select, values) {
                if (!select) {
                    return;
                }
                values.filter(Boolean).sort().forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            addOptions(typeSelect, Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-type") || "";
            }))));

            addOptions(yearSelect, Array.from(new Set(cards.map(function (card) {
                return card.getAttribute("data-year") || "";
            }))));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesType = !type || card.getAttribute("data-type") === type;
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var show = matchesKeyword && matchesType && matchesYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (noResult) {
                    noResult.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playCover");
    if (!video || !cover || !streamUrl) {
        return;
    }

    var attached = false;
    var hlsInstance = null;

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function play() {
        attach();
        cover.classList.add("is-hidden");
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                cover.classList.remove("is-hidden");
            });
        }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
