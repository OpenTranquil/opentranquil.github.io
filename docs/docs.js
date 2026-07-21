/* TranquilOS docs center — search filter + scrollspy */
document.addEventListener("DOMContentLoaded", () => {
  const q = document.getElementById("doc-q");
  const groups = Array.from(document.querySelectorAll(".docs-group"));
  const links = Array.from(document.querySelectorAll(".docs-group a"));
  const secs = Array.from(document.querySelectorAll(".doc-sec"));
  const empty = document.getElementById("docs-empty");

  /* ----- search: filter nav links and content sections together ----- */
  function applyFilter() {
    const needle = (q.value || "").trim().toLowerCase();
    let visibleSecs = 0;
    secs.forEach(sec => {
      const hit = !needle || sec.textContent.toLowerCase().includes(needle);
      sec.classList.toggle("hide", !hit);
      if (hit) visibleSecs++;
    });
    links.forEach(a => {
      const target = document.querySelector(a.getAttribute("href"));
      const hit = !needle || (target && !target.classList.contains("hide"));
      a.classList.toggle("hide", !hit);
    });
    groups.forEach(g => {
      const anyVisible = Array.from(g.querySelectorAll("a")).some(a => !a.classList.contains("hide"));
      g.classList.toggle("hide", !anyVisible);
    });
    if (empty) empty.classList.toggle("show", visibleSecs === 0);
  }
  q && q.addEventListener("input", applyFilter);

  /* ----- scrollspy: highlight the section currently in view ----- */
  if ("IntersectionObserver" in window && secs.length) {
    const byId = {};
    links.forEach(a => { byId[a.getAttribute("href").slice(1)] = a; });
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.remove("on"));
        const active = byId[entry.target.id];
        if (active) active.classList.add("on");
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    secs.forEach(s => spy.observe(s));
  }

  /* ----- mobile: tap search to reveal nav groups, close on pick ----- */
  const side = document.querySelector(".docs-side");
  links.forEach(a => a.addEventListener("click", () => side && side.classList.remove("open")));
});
