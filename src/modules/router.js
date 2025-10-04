// Simple client-side router for the Vite project
class Router {
  constructor() {
    this.routes = {};
    this.init();
  }

  // Add a route
  add(path, handler) {
    this.routes[path] = handler;
  }

  // Initialize the router
  init() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });

    // Handle initial page load
    this.handleRoute();
  }

  // Navigate to a specific path
  navigate(path) {
    window.history.pushState({}, "", path);
    this.handleRoute();
  }

  // Handle the current route
  handleRoute() {
    const path = window.location.pathname;
    const handler = this.routes[path];

    if (handler) {
      handler();
    } else {
      // Default route (404 or fallback)
      this.routes["/"] && this.routes["/"]();
    }
  }

  // Load HTML content
  async loadHTML(htmlFile) {
    try {
      const response = await fetch(htmlFile);
      const html = await response.text();

      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Extract the body content
      const bodyContent = tempDiv.querySelector("body").innerHTML;

      // Replace the current body content
      document.body.innerHTML = bodyContent;

      // Execute any scripts in the loaded content
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        if (script.type) {
          newScript.type = script.type;
        }
        document.head.appendChild(newScript);
      });
    } catch (error) {
      console.error("Error loading HTML:", error);
    }
  }
}

// Create and export router instance
const router = new Router();

// Define routes
router.add("/", () => {
  // Load the main solar system page
  router.loadHTML("/index.html");
});

router.add("/dashboard", () => {
  // Load the dashboard page
  router.loadHTML("/dashboard.html");
});

router.add("/decision_maker", () => {
  // Load the decision maker page
  router.loadHTML("/decision_maker.html");
});

export default router;
