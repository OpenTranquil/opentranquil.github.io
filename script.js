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
    let FOV = 440;
    const ARMS = 3;
    const SPIRAL_TIGHT = 4.6;            // arm winding (rad)
    const pts = [];
    let W = 0, H = 0, cx = 0, cy = 0;
    let coreR = 0, armLen = 0;
    let curSpin = 0, curParRot = 0, curTilt = 0, tRot = 0, tTilt = 0, last = 0, t = 0;
    let raf = null, started = false, visible = true;

    const white = a => "rgba(242,237,237," + a + ")";
    const blue = a => "rgba(122,170,214," + a + ")";

    const build = () => {
      pts.length = 0;
      const n = W < 640 ? 460 : 1000;
      for (let i = 0; i < n; i++) {
        const kind = Math.random();
        let r, a, hot;
        if (kind < 0.45) {                 // central bulge
          r = coreR * Math.pow(Math.random(), 1.4);
          a = Math.random() * 6.2832;
          hot = 1;
        } else if (kind < 0.97) {          // spiral arm (dominant)
          const arm = i % ARMS;
          const tt = Math.pow(Math.random(), 1.8);
          r = coreR + tt * armLen;
          a = (arm / ARMS) * 6.2832 + tt * SPIRAL_TIGHT + (Math.random() - 0.5) * 0.24;
          hot = 1 - tt * 0.45;
        } else {                           // sparse scattered field
          r = coreR + Math.random() * armLen;
          a = Math.random() * 6.2832;
          hot = 0.25;
        }
        pts.push({ r, a, hot, ph: Math.random() * 6.2832, acc: i % 23 === 0 });
      }
    };

    const resize = () => {
      W = heroCanvas.clientWidth || 1;
      H = heroCanvas.clientHeight || 1;
      heroCanvas.width = W * DPR;
      heroCanvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2;
      coreR = Math.min(W, H) * 0.14;
      armLen = Math.min(W, H) * 0.66;
      // keep the near side from crossing the camera plane; weaker perspective so a
      // larger galaxy still fits the (short, wide) hero without clipping
      FOV = Math.max(500, (coreR + armLen) * 4);
      build();
    };

    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      t += dt;
      curSpin += dt * 0.06;                      // slow rigid rotation
      curParRot += (tRot - curParRot) * 0.05;    // cursor parallax
      curTilt += (tTilt - curTilt) * 0.05;
      const tilt = 0.48 + curTilt;               // ~28deg for subtle depth
      const sE = Math.sin(tilt), cE = Math.cos(tilt);
      const breath = 1 + 0.02 * Math.sin(t * 0.6);

      const list = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const ang = p.a + curSpin + curParRot;
        const r = p.r * breath;
        const wx = r * Math.cos(ang);
        const wz = r * Math.sin(ang);
        const depth = wz * cE;
        const s = FOV / (FOV + depth);
        if (s <= 0.02) continue;
        const px = cx + wx * s;
        const py = cy + (-wz * sE) * s;
        if (px < -14 || px > W + 14 || py < -14 || py > H + 14) continue;
        const depth01 = Math.max(0, Math.min(1, (depth / (armLen * cE) + 1) / 2));
        const nearBright = 1 - depth01 * 0.5;
        const tw = 0.68 + 0.32 * Math.sin(t * 2 + p.ph);
        const alpha = Math.max(0, (0.10 + 0.52 * p.hot * nearBright) * tw);
        const size = 0.8 + s * 1.2 + p.hot * 1.1;
        list.push({ x: px, y: py, s: size, a: alpha, d: depth, acc: p.acc });
      }
      list.sort((a, b) => b.d - a.d);            // farthest first

      ctx.clearRect(0, 0, W, H);

      // elliptical disk halo (matches the tilted galaxy)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, sE);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, armLen * 0.9);
      g.addColorStop(0, "rgba(242,237,237,0.14)");
      g.addColorStop(0.5, "rgba(242,237,237,0.05)");
      g.addColorStop(1, "rgba(242,237,237,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-armLen, -armLen, armLen * 2, armLen * 2);
      ctx.restore();

      // bright glowing core
      const c = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(50, coreR * 2.4));
      c.addColorStop(0, "rgba(242,237,237,0.26)");
      c.addColorStop(0.35, "rgba(242,237,237,0.08)");
      c.addColorStop(1, "rgba(242,237,237,0)");
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < list.length; i++) {
        const q = list[i];
        ctx.fillStyle = q.acc ? blue(q.a) : white(q.a);
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.s, 0, 6.2832);
        ctx.fill();
        if (q.s > 2.1) {
          ctx.globalAlpha = q.a * 0.3;
          ctx.beginPath(); ctx.arc(q.x, q.y, q.s * 2.2, 0, 6.2832); ctx.fill();
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
      tRot = (e.clientX / window.innerWidth - 0.5) * 0.18;
      tTilt = (e.clientY / window.innerHeight - 0.5) * 0.10;
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
