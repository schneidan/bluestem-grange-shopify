(function () {
  var compact = document.querySelector("[data-compact-header]");
  var hero = document.querySelector("[data-hero-header]");

  if (compact) {
    if (!hero) {
      compact.classList.add("is-visible");
    } else {
      var update = function () {
        var threshold = Math.max(hero.offsetHeight - 56, 80);
        compact.classList.toggle("is-visible", window.scrollY > threshold);
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
    }
  }

  var dropdowns = Array.prototype.slice.call(
    document.querySelectorAll("[data-toolbar-dropdown]")
  );

  var setOpen = function (root, open) {
    var toggle = root.querySelector("[data-toolbar-dropdown-toggle]");
    var panel = root.querySelector("[data-toolbar-dropdown-panel]");
    if (!toggle || !panel) return;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  var closeAll = function (except) {
    dropdowns.forEach(function (root) {
      if (root !== except) setOpen(root, false);
    });
  };

  dropdowns.forEach(function (root) {
    var toggle = root.querySelector("[data-toolbar-dropdown-toggle]");
    var panel = root.querySelector("[data-toolbar-dropdown-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var willOpen = panel.hidden;
      closeAll(root);
      setOpen(root, willOpen);
    });
  });

  document.addEventListener("click", function () {
    closeAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeAll();
  });

  var searchPanel = document.querySelector("[data-search-panel]");
  var searchToggles = document.querySelectorAll("[data-search-toggle]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchResults = document.querySelector("[data-search-results]");
  var searchForm = document.querySelector("[data-search-form]");
  var searchClose = document.querySelector("[data-search-close]");
  var searchTimer = null;

  var setSearchOpen = function (open) {
    if (!searchPanel) return;
    searchPanel.hidden = !open;
    searchToggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (open && searchInput) {
      window.setTimeout(function () {
        searchInput.focus();
        searchInput.select();
      }, 10);
    }
  };

  var formatMoney = function (amount) {
    if (amount == null || amount === "") return "";
    var value = Number(amount);
    if (Number.isNaN(value)) return String(amount);
    /* Predictive search returns major currency units (e.g. 10.00), not cents. */
    return "$" + value.toFixed(2);
  };

  var renderSearchResults = function (products, query) {
    if (!searchResults) return;

    if (!products || !products.length) {
      searchResults.hidden = false;
      searchResults.innerHTML =
        '<p class="site-search__empty">No products match “' +
        query.replace(/</g, "&lt;") +
        '”.</p>';
      return;
    }

    searchResults.hidden = false;
    searchResults.innerHTML = products
      .map(function (product) {
        var image =
          (product.image && (product.image.url || product.image)) ||
          (product.featured_image &&
            (product.featured_image.url || product.featured_image)) ||
          "";
        var price = product.price
          ? formatMoney(product.price)
          : product.price_min != null
            ? formatMoney(product.price_min)
            : "";
        var title = product.title || "";
        var url = product.url || "#";

        return (
          '<a class="site-search__result" href="' +
          url +
          '">' +
          (image
            ? '<img src="' + image + '" alt="" width="80" height="80" loading="lazy">'
            : "<span></span>") +
          '<span class="site-search__result-title">' +
          title.replace(/</g, "&lt;") +
          "</span>" +
          '<span class="site-search__result-price">' +
          price +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  };

  var runSuggest = function (query) {
    if (!searchPanel || !searchResults) return;
    var trimmed = (query || "").trim();
    if (trimmed.length < 2) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      return;
    }

    var base = searchPanel.getAttribute("data-suggest-url") || "/search/suggest.json";
    var url =
      base +
      "?q=" +
      encodeURIComponent(trimmed) +
      "&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last";

    searchResults.hidden = false;
    searchResults.innerHTML = '<p class="site-search__status">Searching…</p>';

    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var products =
          (data.resources &&
            data.resources.results &&
            data.resources.results.products) ||
          [];
        renderSearchResults(products, trimmed);
      })
      .catch(function () {
        searchResults.hidden = false;
        searchResults.innerHTML =
          '<p class="site-search__empty">Search is unavailable right now.</p>';
      });
  };

  searchToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setSearchOpen(searchPanel.hidden);
    });
  });

  if (searchClose) {
    searchClose.addEventListener("click", function () {
      setSearchOpen(false);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        runSuggest(searchInput.value);
      }, 220);
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!searchInput) return;
      runSuggest(searchInput.value);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setSearchOpen(false);
  });

  var relatedRoots = document.querySelectorAll("[data-related-products]");

  relatedRoots.forEach(function (root) {
    var url = root.getAttribute("data-url");
    if (!url) return;

    fetch(url)
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var section = doc.querySelector(".related-products");
        if (!section) return;
        root.replaceWith(section);
      })
      .catch(function () {
        /* Keep collection-based fallback already rendered in Liquid. */
      });
  });

  var galleries = document.querySelectorAll("[data-product-gallery]");

  galleries.forEach(function (gallery) {
    var main = gallery.querySelector("[data-product-gallery-main]");
    var thumbs = gallery.querySelectorAll("[data-product-gallery-thumb]");
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-src");
        var alt = thumb.getAttribute("data-alt") || "";
        if (!src) return;

        main.src = src;
        main.alt = alt;

        thumbs.forEach(function (item) {
          var active = item === thumb;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    });
  });

  var tagFilters = document.querySelectorAll("[data-tag-filter]");

  tagFilters.forEach(function (root) {
    var clear = root.querySelector("[data-tag-filter-clear]");
    var baseUrl = root.getAttribute("data-collection-url") || "";
    if (!baseUrl) return;

    var applyTags = function () {
      var checked = Array.prototype.slice
        .call(root.querySelectorAll("[data-tag-filter-input]:checked"))
        .map(function (input) {
          return input.value;
        })
        .filter(Boolean);

      if (checked.length === 0) {
        window.location.href = baseUrl;
        return;
      }

      window.location.href = baseUrl + "/" + checked.join("+");
    };

    root.addEventListener("change", function (event) {
      if (!event.target.matches("[data-tag-filter-input]")) return;
      applyTags();
    });

    if (clear) {
      clear.addEventListener("click", function () {
        window.location.href = baseUrl;
      });
    }

    root.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });
})();
