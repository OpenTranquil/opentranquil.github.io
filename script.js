/* TranquilOS — shared interactions
   Mobile navigation, scroll reveals, boot-log typing, copy button, section indices.
   Dark-only: no theme toggle. Language switching is plain links between mirrored
   page trees (/ ↔ /en/) — no JS string swapping. */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const isChinese = root.lang.toLowerCase().startsWith("zh");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- mobile nav: close after tapping a link (checkbox-hack menu) ----- */
  const navToggle = document.getElementById("nav-toggle");
  document.querySelectorAll(".hd-nav a").forEach(a =>
    a.addEventListener("click", () => { if (navToggle) navToggle.checked = false; }));

  /* ----- scroll reveals ----- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  revealEls.forEach(el => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.transitionDelay = (Number(d) * 120) + "ms";
  });
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
    /* safety net: never leave content hidden if observation misses */
    setTimeout(() => {
      revealEls.forEach(el => {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < innerHeight * 1.5) {
          el.classList.add("in");
        }
      });
    }, 1500);
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* ----- boot log: stream lines, then loop ----- */
  const blBody = document.getElementById("bootlog-body");
  if (blBody && !prefersReduced) {
    const lines = Array.from(blBody.children).map(n => n.outerHTML);
    let i = 0;
    const boot = () => {
      blBody.innerHTML = "";
      i = 0;
      const step = () => {
        if (i < lines.length) {
          const s = document.createElement("span");
          s.className = "bl-line";
          s.innerHTML = lines[i];
          s.style.opacity = "0";
          s.style.transition = "opacity .4s var(--ease-out)";
          blBody.appendChild(s);
          requestAnimationFrame(() => { s.style.opacity = "1"; });
          i++;
          setTimeout(step, 380);
        } else {
          const c = document.createElement("span");
          c.className = "bl-cursor";
          blBody.appendChild(c);
          setTimeout(boot, 7000);
        }
      };
      step();
    };
    boot();
  }

  /* ----- copy-to-clipboard for terminal panels ----- */
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const panel = btn.closest(".term, .bootlog");
      const code = panel ? panel.querySelector(".term-b, .bootlog-b").innerText : "";
      try { await navigator.clipboard.writeText(code); } catch (e) {}
      const done = btn.getAttribute("data-copy-done") || "✓";
      const label = btn.textContent;
      btn.textContent = done;
      btn.classList.add("done");
      setTimeout(() => { btn.textContent = label; btn.classList.remove("done"); }, 1800);
    });
  });

  /* ----- cursor inversion lens (decorative; primary pointer only) ----- */
  // A round "spotlight" that trails the pointer and inverts colors beneath it.
  // Skipped on touch / coarse pointers; respects prefers-reduced-motion.
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    const lens = document.createElement("div");
    lens.className = "cursor-invert";
    lens.setAttribute("aria-hidden", "true");
    document.body.appendChild(lens);

    let tx = -1000, ty = -1000;  // pointer target
    let cx = -1000, cy = -1000;  // current (smoothed) position
    let shown = false;

    const place = () => { lens.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; };
    const reveal = () => {
      if (!shown) {
        shown = true;
        cx = tx; cy = ty;        // snap onto the pointer on first appearance
        place();
        lens.style.opacity = "1";
      }
    };
    const hide = () => { shown = false; lens.style.opacity = "0"; };

    if (prefersReduced) {
      window.addEventListener("mousemove", (e) => {
        cx = tx = e.clientX; cy = ty = e.clientY;
        reveal(); place();
      }, { passive: true });
    } else {
      const tick = () => {
        cx += (tx - cx) * 0.22;
        cy += (ty - cy) * 0.22;
        place();
        requestAnimationFrame(tick);
      };
      window.addEventListener("mousemove", (e) => {
        tx = e.clientX; ty = e.clientY; reveal();
      }, { passive: true });
      requestAnimationFrame(tick);
    }

    document.addEventListener("mouseleave", hide);
  }

});
