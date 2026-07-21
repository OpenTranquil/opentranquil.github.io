/* TranquilOS — shared interactions
   Theme toggle (persisted), spotlight cards, staggered reveals, terminal
   boot-line animation. Language switching is plain links between mirrored
   page trees (/ ↔ /en/) — no JS string swapping. */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const toggle = document.getElementById("tog");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- theme ----- */
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("tq-theme", theme); } catch (e) {}
    if (toggle) {
      toggle.textContent = theme === "dark" ? "☾" : "☀";
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }
  let stored = "dark";
  try { stored = localStorage.getItem("tq-theme") || "dark"; } catch (e) {}
  setTheme(stored);
  toggle && toggle.addEventListener("click", () =>
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ----- mobile nav: close after tapping a link (checkbox-hack menu) ----- */
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".hd-nav a").forEach(a =>
    a.addEventListener("click", () => { if (navToggle) navToggle.checked = false; }));

  /* ----- spotlight cards: radial highlight follows the cursor ----- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card, .dl-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ----- terminal boot lines: split into .tl spans, replay on view ----- */
  const termBodies = [];
  document.querySelectorAll(".term-b").forEach(body => {
    const lines = body.innerHTML.split("\n").filter(l => l.trim() !== "");
    body.innerHTML = lines.map(l => `<span class="tl pre">${l}</span>`).join("");
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "▊";
    const last = body.querySelector(".tl:last-child");
    if (last) last.appendChild(cursor);
    termBodies.push(body);
    if (reduced) body.querySelectorAll(".tl").forEach(t => t.classList.remove("pre"));
  });

  /* ----- unified IntersectionObserver: reveals + terminal replay ----- */
  if (!reduced && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains("term-b")) {
          el.querySelectorAll(".tl").forEach((t, i) => {
            t.style.transitionDelay = `${Math.min(i * 110, 1600)}ms`;
            requestAnimationFrame(() => t.classList.add("in"));
          });
        } else {
          el.classList.add("in");
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.08 });

    termBodies.forEach(b => obs.observe(b));

    /* staggered reveal for children of grid-like containers */
    document.querySelectorAll(".grid, .pipe, .metrics, .lanes, .chips").forEach(group => {
      Array.from(group.children).forEach((child, i) => {
        child.classList.add("rv");
        child.style.transitionDelay = `${Math.min(i * 55, 330)}ms`;
        obs.observe(child);
      });
    });
    /* standalone blocks */
    document.querySelectorAll(".phero, .sec-head, .term, .svg-scroll, .note, .tbl-wrap, .split > pre").forEach(el => {
      el.classList.add("rv");
      obs.observe(el);
    });
  } else {
    /* no motion: everything visible immediately */
    document.querySelectorAll(".rv").forEach(el => el.classList.add("in"));
  }
});
