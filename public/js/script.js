document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".menu a");

  links.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active"); // Ensure no duplicates
    }
  });
});

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/"; // Fallback if no history exists
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  if (!toggle) return;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    html.setAttribute("data-theme", "light");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      html.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      html.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  });
}
setupThemeToggle();
