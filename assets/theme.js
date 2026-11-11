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

  var homeGrids = document.querySelectorAll("[data-home-product-grid]");

  homeGrids.forEach(function (grid) {
    var pageSize = Number(grid.getAttribute("data-page-size") || 12);
    var wrap = grid.closest(".page-width") || grid.parentElement;
    var button = wrap ? wrap.querySelector("[data-home-view-more]") : null;
    if (!button) return;

    var revealNext = function () {
      var hidden = Array.prototype.slice.call(
        grid.querySelectorAll("[data-home-product-item][hidden]")
      );
      hidden.slice(0, pageSize).forEach(function (item) {
        item.hidden = false;
      });
      if (grid.querySelectorAll("[data-home-product-item][hidden]").length === 0) {
        button.hidden = true;
      }
    };

    button.addEventListener("click", revealNext);
  });

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

  var escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  var safeUrl = function (value) {
    var url = String(value || "").trim();
    if (!url) return "#";
    /* Allow Shopify relative paths and https CDN/product URLs only. */
    if (url.indexOf("/") === 0 || url.indexOf("https://") === 0) {
      return escapeHtml(url);
    }
    return "#";
  };

  var renderSearchResults = function (products, query) {
    if (!searchResults) return;

    if (!products || !products.length) {
      searchResults.hidden = false;
      searchResults.innerHTML =
        '<p class="site-search__empty">No products match “' +
        escapeHtml(query) +
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
        var url = safeUrl(product.url);

        return (
          '<a class="site-search__result" href="' +
          url +
          '">' +
          (image
            ? '<img src="' +
              safeUrl(image) +
              '" alt="" width="80" height="80" loading="lazy">'
            : "<span></span>") +
          '<span class="site-search__result-title">' +
          escapeHtml(title) +
          "</span>" +
          '<span class="site-search__result-price">' +
          escapeHtml(price) +
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
      if (!searchPanel) return;
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

  var productRoots = document.querySelectorAll("[data-product]");

  productRoots.forEach(function (root) {
    var form = root.querySelector("form.product-form") || root.querySelector("form");
    var qtyInput = root.querySelector("[data-qty-input]");
    var showLowStock = root.getAttribute("data-show-low-stock") === "true";

    var jsonEl = root.querySelector("[data-product-json]");
    if (!jsonEl || !form) return;

    var product;
    try {
      product = JSON.parse(jsonEl.textContent);
    } catch (error) {
      return;
    }

    var variantInput = form.querySelector("[data-product-variant-id]");
    var priceEl = root.querySelector("[data-product-price]");
    var inventoryEl = root.querySelector("[data-product-inventory]");
    var addButton = form.querySelector("[data-product-add]");
    var soldOutNote = form.querySelector("[data-product-soldout-note]");
    var mainImage = root.querySelector("[data-product-gallery-main]");
    var thumbs = root.querySelectorAll("[data-product-gallery-thumb]");
    var lowStockThreshold = Number(
      (root.getAttribute("data-low-stock") || "5").trim()
    );

    var formatMoney = function (cents) {
      var value = Number(cents);
      if (Number.isNaN(value)) return "";
      return "$" + (value / 100).toFixed(2);
    };

    var selectedOptions = function () {
      return Array.prototype.slice
        .call(form.querySelectorAll("[data-option-input]:checked"))
        .map(function (input) {
          return input.value;
        });
    };

    var findVariant = function (options) {
      return product.variants.find(function (variant) {
        return options.every(function (value, index) {
          return variant["option" + (index + 1)] === value;
        });
      });
    };

    var updateOptionAvailability = function (options) {
      var optionSets = form.querySelectorAll("[data-product-option]");
      optionSets.forEach(function (fieldset, optionIndex) {
        var inputs = fieldset.querySelectorAll("[data-option-input]");
        inputs.forEach(function (input) {
          var trial = options.slice();
          trial[optionIndex] = input.value;
          var match = product.variants.find(function (variant) {
            return trial.every(function (value, index) {
              return !value || variant["option" + (index + 1)] === value;
            });
          });
          var availableMatch = product.variants.find(function (variant) {
            return (
              variant.available &&
              trial.every(function (value, index) {
                return !value || variant["option" + (index + 1)] === value;
              })
            );
          });
          input.disabled = !match;
          input.parentElement.classList.toggle("is-unavailable", !availableMatch);
        });
      });
    };

    var setGalleryImage = function (variant) {
      if (!mainImage || !variant || !variant.featured_image) return;
      var image = variant.featured_image;

      if (image.id && thumbs.length) {
        var matched = false;
        thumbs.forEach(function (thumb) {
          var active = String(thumb.getAttribute("data-image-id")) === String(image.id);
          thumb.classList.toggle("is-active", active);
          thumb.setAttribute("aria-pressed", active ? "true" : "false");
          if (active) {
            matched = true;
            var thumbSrc = thumb.getAttribute("data-src");
            var thumbAlt = thumb.getAttribute("data-alt") || "";
            if (thumbSrc) {
              mainImage.src = thumbSrc;
              mainImage.alt = thumbAlt;
            }
          }
        });
        if (matched) return;
      }

      if (image.src) {
        mainImage.src = image.src;
        if (image.alt) mainImage.alt = image.alt;
      }
    };

    var updateBuyState = function (variant) {
      if (!variant) {
        if (addButton) {
          addButton.disabled = true;
          addButton.textContent = "Unavailable";
        }
        if (soldOutNote) soldOutNote.hidden = true;
        if (inventoryEl) {
          inventoryEl.hidden = false;
          inventoryEl.textContent = "Unavailable";
          inventoryEl.classList.add("product__inventory--sold-out");
        }
        return;
      }

      if (variantInput) variantInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);

      var available = !!variant.available;
      if (addButton) {
        addButton.disabled = !available;
        addButton.textContent = available ? "Add to cart" : "Sold out";
      }
      if (soldOutNote) soldOutNote.hidden = available;

      var tracked = variant.inventory_management != null;
      var qty = Number(variant.inventory_quantity);
      if (!available) {
        if (inventoryEl) {
          inventoryEl.hidden = false;
          inventoryEl.textContent = "Sold out";
          inventoryEl.classList.add("product__inventory--sold-out");
          inventoryEl.classList.remove("product__inventory--low");
        }
      } else if (
        showLowStock &&
        tracked &&
        qty > 0 &&
        qty <= lowStockThreshold
      ) {
        if (inventoryEl) {
          inventoryEl.hidden = false;
          inventoryEl.textContent = "Low inventory — only " + qty + " left";
          inventoryEl.classList.remove("product__inventory--sold-out");
          inventoryEl.classList.add("product__inventory--low");
        }
      } else if (inventoryEl) {
        inventoryEl.hidden = true;
        inventoryEl.textContent = "";
        inventoryEl.classList.remove("product__inventory--sold-out");
        inventoryEl.classList.remove("product__inventory--low");
      }

      if (qtyInput) {
        qtyInput.removeAttribute("max");
      }

      setGalleryImage(variant);

      if (variant.id && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set("variant", variant.id);
        window.history.replaceState({}, "", url.toString());
      }
    };

    var syncVariant = function () {
      var options = selectedOptions();
      updateOptionAvailability(options);
      updateBuyState(findVariant(options) || product.variants[0]);
    };

    form.addEventListener("change", function (event) {
      if (!event.target.matches("[data-option-input]")) return;
      syncVariant();
    });

    if (!product.has_only_default_variant) syncVariant();
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
