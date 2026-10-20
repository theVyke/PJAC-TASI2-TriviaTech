const THEME_KEY = "triviatech_theme_preference";

export const themeManager = {
  init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "dark"); // Dark como padrão tecnológico

    this.applyTheme(initialTheme);

    const toggleBtn = document.getElementById("theme-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleTheme());
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    this.updateIcon(theme);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(nextTheme);
  },

  updateIcon(theme) {
    const icon = document.getElementById("theme-toggle-icon");
    if (!icon) return;
    if (theme === "dark") {
      icon.className = "bi bi-sun-fill text-warning";
    } else {
      icon.className = "bi bi-moon-stars-fill text-primary";
    }
  }
};
