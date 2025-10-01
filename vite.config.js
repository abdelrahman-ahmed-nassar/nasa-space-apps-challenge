import fs from "fs";
import path from "path";

export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true, // Open to local network and display URL
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
  },
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
    rollupOptions: {
      input: {
        main: "src/index.html",
        dashboard: "src/dashboard.html",
      },
    },
  },
  // Custom plugin to handle clean URLs
  plugins: [
    {
      name: "dashboard-route",
      configureServer(server) {
        server.middlewares.use("/dashboard", (req, res, next) => {
          // Serve dashboard.html content at /dashboard route
          const dashboardPath = path.join(
            process.cwd(),
            "src",
            "dashboard.html"
          );

          try {
            const content = fs.readFileSync(dashboardPath, "utf8");
            res.writeHead(200, {
              "Content-Type": "text/html; charset=utf-8",
            });
            res.end(content);
          } catch (err) {
            next();
          }
        });
      },
    },
  ],
};
