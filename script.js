/* TranquilOS — shared interactions
   Theme toggle and mobile navigation. Language switching is plain links between mirrored
   page trees (/ ↔ /en/) — no JS string swapping. */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const toggle = document.getElementById("tog");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const isChinese = root.lang.toLowerCase().startsWith("zh");

  /* ----- theme ----- */
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#11110F" : "#F1EFE8");
    try { localStorage.setItem("tq-theme", theme); } catch (e) {}
    if (toggle) {
      toggle.textContent = theme === "dark" ? "☾" : "☀";
      toggle.setAttribute("aria-label", isChinese
        ? (theme === "dark" ? "切换到浅色主题" : "切换到深色主题")
        : (theme === "dark" ? "Switch to light theme" : "Switch to dark theme"));
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

});
