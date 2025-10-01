// Navigation helper for the solar system app
export class Navigation {
  constructor() {
    this.init();
  }

  init() {
    // Handle navigation clicks
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        // For dashboard route, navigate directly without redirect
        if (href === "/dashboard") {
          window.location.href = "/dashboard";
        } else {
          this.navigate(href);
        }
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });

    // Handle initial route
    this.handleRoute();
  }

  navigate(path) {
    window.history.pushState({}, "", path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;

    switch (path) {
      case "/dashboard":
        // Dashboard route is handled by Vite middleware
        break;
      case "/":
      default:
        // Already on main page, no action needed
        break;
    }
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Navigation();
});
