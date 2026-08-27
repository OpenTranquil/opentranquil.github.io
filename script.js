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

  /* ----- hero 3D particle background (decorative; JS-gated) ----- */
  const heroCanvas = document.getElementById("hero-particles");
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FOV = 620;
    const pts = [];
    let W = 0, H = 0, cx = 0, cy = 0;
    let baseY = 0, tiltX = 0, tiltY = 0, tX = 0, tY = 0, t = 0;
    let raf = null, started = false, visible = true;

    const white = a => "rgba(242,237,237," + a + ")";
    const blue = a => "rgba(122,170,214," + a + ")";

    const build = () => {
      pts.length = 0;
      const n = W < 640 ? 320 : 720;
      for (let i = 0; i < n; i++) {
        pts.push({
          x: (Math.random() * 2 - 1) * 0.75,
          y: (Math.random() * 2 - 1) * 0.55,
          z: (Math.random() * 2 - 1),
          ph: Math.random() * 6.2832,
          acc: i % 21 === 0
        });
      }
    };

    const resize = () => {
      W = heroCanvas.clientWidth || 1;
      H = heroCanvas.clientHeight || 1;
      heroCanvas.width = W * DPR;
      heroCanvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2;
      build();
    };

    const draw = () => {
      t += 0.016;
      baseY += 0.0016;
      tiltX += (tX - tiltX) * 0.05;
      tiltY += (tY - tiltY) * 0.05;
      const ry = baseY + tiltY;
      const rx = -0.22 + tiltX;
      const sY = Math.sin(ry), cY = Math.cos(ry);
      const sX = Math.sin(rx), cX = Math.cos(rx);
      const X = W * 0.72, Y = H * 0.52, Z = 200;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x1 = p.x * cY + p.z * sY;
        const z1 = -p.x * sY + p.z * cY;
        const y1 = p.y * cX - z1 * sX;
        const z2 = p.y * sX + z1 * cX;
        const s = FOV / (FOV + z2 * Z);
        if (s <= 0.03) continue;
        const sx = cx + x1 * X * s;
        const sy = cy + y1 * Y * s;
        if (sx < -14 || sx > W + 14 || sy < -14 || sy > H + 14) continue;
        const depth = Math.max(0, Math.min(1, (z2 + 1) / 2));
        const tw = 0.6 + 0.4 * Math.sin(t * 2 + p.ph);
        const alpha = ((1 - depth) * 0.42 + 0.03) * tw;
        const r = 1.0 + s * 1.8;
        ctx.fillStyle = p.acc ? blue(alpha) : white(alpha);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 6.2832);
        ctx.fill();
        if (s > 1.15 && !p.acc) {
          ctx.globalAlpha = alpha * 0.28;
          ctx.beginPath(); ctx.arc(sx, sy, r * 2.6, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    };

    const frame = () => {
      if (!started || !visible || document.hidden) return;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (started) return;
      started = true;
      if (prefersReduced) { draw(); return; }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      started = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };

    // gentle tilt toward the pointer across the viewport (no layout reads)
    window.addEventListener("mousemove", e => {
      tY = (e.clientX / window.innerWidth - 0.5) * 0.6;
      tX = (e.clientY / window.innerHeight - 0.5) * 0.5;
    }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("load", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else if (visible) start();
    });

    resize();
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        visible = en.isIntersecting;
        if (visible) start(); else stop();
      });
    }, { threshold: 0 }).observe(heroCanvas);
    start();
  }

});
