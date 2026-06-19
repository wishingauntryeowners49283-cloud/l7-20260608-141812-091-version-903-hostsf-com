(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const nextButton = hero.querySelector("[data-hero-next]");
        const prevButton = hero.querySelector("[data-hero-prev]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const dotIndex = Number(dot.getAttribute("data-hero-dot"));
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
        const area = form.parentElement;
        const cards = Array.from(area.querySelectorAll(".movie-card"));
        const params = new URLSearchParams(window.location.search);

        const q = form.querySelector("[name='q']");
        const region = form.querySelector("[name='region']");
        const type = form.querySelector("[name='type']");
        const year = form.querySelector("[name='year']");

        if (q && params.get("q")) {
            q.value = params.get("q");
        }
        if (region && params.get("region")) {
            region.value = params.get("region");
        }
        if (type && params.get("type")) {
            type.value = params.get("type");
        }
        if (year && params.get("year")) {
            year.value = params.get("year");
        }

        function apply() {
            const query = q ? q.value.trim().toLowerCase() : "";
            const regionValue = region ? region.value : "";
            const typeValue = type ? type.value : "";
            const yearValue = year ? year.value : "";

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();

                const matchedQuery = !query || haystack.indexOf(query) !== -1;
                const matchedRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                const matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
                const matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;

                card.classList.toggle("is-filter-hidden", !(matchedQuery && matchedRegion && matchedType && matchedYear));
            });
        }

        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        apply();
    });
}());
