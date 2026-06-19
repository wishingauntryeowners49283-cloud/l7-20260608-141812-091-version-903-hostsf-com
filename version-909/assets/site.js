(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(isOpen));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var root = panel.closest("main") || document;
            var search = panel.querySelector(".filter-search");
            var yearSelect = panel.querySelector(".filter-year");
            var typeSelect = panel.querySelector(".filter-type");
            var regionSelect = panel.querySelector(".filter-region");
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var empty = root.querySelector(".no-results");

            function readValue(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function applyFilters() {
                var keyword = readValue(search);
                var year = readValue(yearSelect);
                var type = readValue(typeSelect);
                var region = readValue(regionSelect);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || String(card.getAttribute("data-year") || "").toLowerCase() === year;
                    var matchType = !type || String(card.getAttribute("data-type") || "").toLowerCase() === type;
                    var matchRegion = !region || String(card.getAttribute("data-region") || "").toLowerCase() === region;
                    var ok = matchKeyword && matchYear && matchType && matchRegion;

                    card.classList.toggle("hidden-card", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [search, yearSelect, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
        });
    });
})();

function initMoviePlayer(playbackUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsPlayer = null;
    var requested = false;
    var mediaReady = false;

    if (!video || !button || !playbackUrl) {
        return;
    }

    function showButton() {
        button.classList.remove("is-hidden");
    }

    function hideButton() {
        button.classList.add("is-hidden");
    }

    function requestPlay() {
        requested = true;
        hideButton();

        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                if (mediaReady) {
                    showButton();
                }
            });
        }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
        video.load();
        video.addEventListener("loadedmetadata", function () {
            mediaReady = true;
            if (requested) {
                requestPlay();
            }
        }, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hlsPlayer.loadSource(playbackUrl);
        });
        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
            mediaReady = true;
            if (requested) {
                requestPlay();
            }
        });
        hlsPlayer.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsPlayer.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsPlayer.recoverMediaError();
                } else {
                    hlsPlayer.destroy();
                    showButton();
                }
            }
        });
    } else {
        video.src = playbackUrl;
        video.load();
        mediaReady = true;
    }

    button.addEventListener("click", requestPlay);
    video.addEventListener("click", function () {
        if (video.paused) {
            requestPlay();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
