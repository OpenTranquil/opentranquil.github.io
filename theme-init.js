/* Apply the saved theme before styles render to prevent a visible color transition. */
try {
  const theme = localStorage.getItem("tq-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#11110F" : "#F2F3F0");
} catch (e) {}
