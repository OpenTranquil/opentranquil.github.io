/* Apply the fixed dark theme before styles render.
   Dark-only design: the site always renders in dark mode.
   Also flags JS availability for progressive-enhancement selectors (.js gate). */
try {
  document.documentElement.classList.add("js");
  document.documentElement.setAttribute("data-theme", "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0A0A0B");
} catch (e) {}
