(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var empty = scope.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }

            function apply() {
                var term = normalize(input ? input.value : "");
                var selectedYear = normalize(year ? year.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.textContent
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matchTerm = !term || haystack.indexOf(term) !== -1;
                    var matchYear = !selectedYear || cardYear === selectedYear;
                    var ok = matchTerm && matchYear;
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video[data-video]");
            var button = shell.querySelector("[data-play-button]");
            var message = shell.querySelector("[data-player-message]");
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-video");

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function playVideo() {
                if (!source) {
                    setMessage("播放源暂不可用");
                    return;
                }
                shell.classList.add("is-playing");
                video.controls = true;
                setMessage("正在加载影片...");
                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._hlsReady) {
                        var hls = new window.Hls();
                        video._hlsReady = true;
                        video._hlsPlayer = hls;
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().then(function () {
                                setMessage("");
                            }).catch(function () {
                                setMessage("点击视频继续播放");
                            });
                        });
                        hls.on(window.Hls.Events.ERROR, function () {
                            setMessage("播放失败，请稍后重试");
                        });
                    } else {
                        video.play().then(function () {
                            setMessage("");
                        }).catch(function () {
                            setMessage("点击视频继续播放");
                        });
                    }
                } else {
                    if (!video.getAttribute("src")) {
                        video.setAttribute("src", source);
                    }
                    video.play().then(function () {
                        setMessage("");
                    }).catch(function () {
                        setMessage("点击视频继续播放");
                    });
                }
            }

            button.addEventListener("click", playVideo);
            shell.addEventListener("click", function (event) {
                if (event.target === video || event.target === shell) {
                    playVideo();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
