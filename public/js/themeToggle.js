function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const body = document.body;

  if (!toggle) return;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-theme");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    const isLight = toggle.checked;
    body.classList.toggle("light-theme", isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}
setupThemeToggle();
