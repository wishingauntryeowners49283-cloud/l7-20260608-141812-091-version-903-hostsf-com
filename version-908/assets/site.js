(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        const input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });

    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-page]").forEach(function (panel) {
      const input = panel.querySelector("[data-filter-input]");
      const chips = Array.from(panel.querySelectorAll("[data-filter-value]"));
      const grid = panel.parentElement.querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");
      const cards = grid ? Array.from(grid.querySelectorAll("[data-movie-card]")) : [];
      if (!input || !grid || cards.length === 0) {
        return;
      }
      let chipValue = "全部";
      let message = grid.querySelector(".no-results");
      if (!message) {
        message = document.createElement("div");
        message.className = "no-results";
        message.textContent = "没有找到匹配的影片";
        grid.appendChild(message);
      }

      function apply() {
        const query = normalize(input.value);
        const chip = normalize(chipValue === "全部" ? "" : chipValue);
        let visible = 0;
        cards.forEach(function (card) {
          const text = normalize(card.getAttribute("data-filter-text") || card.textContent);
          const matchQuery = !query || text.indexOf(query) !== -1;
          const matchChip = !chip || text.indexOf(chip) !== -1;
          const show = matchQuery && matchChip;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        message.style.display = visible === 0 ? "block" : "none";
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          chipValue = chip.getAttribute("data-filter-value") || "全部";
          apply();
        });
      });

      input.addEventListener("input", apply);
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        input.value = q;
      }
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      const video = shell.querySelector("video");
      const button = shell.querySelector(".player-overlay");
      if (!video || !button) {
        return;
      }
      let attached = false;
      let hls = null;

      function attach() {
        if (attached) {
          return;
        }
        const src = video.getAttribute("data-stream");
        if (!src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          attached = true;
          return;
        }
        video.src = src;
        attached = true;
      }

      function play() {
        attach();
        video.controls = true;
        shell.classList.add("is-playing");
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
