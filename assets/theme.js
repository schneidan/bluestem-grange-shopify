(function () {
  var compact = document.querySelector("[data-compact-header]");
  var hero = document.querySelector("[data-hero-header]");

  if (!compact) return;

  if (!hero) {
    compact.classList.add("is-visible");
    return;
  }

  var update = function () {
    var threshold = Math.max(hero.offsetHeight - 56, 80);
    compact.classList.toggle("is-visible", window.scrollY > threshold);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();
