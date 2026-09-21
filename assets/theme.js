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
