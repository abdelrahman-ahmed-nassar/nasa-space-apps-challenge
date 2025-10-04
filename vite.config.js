import fs from "fs";
import path from "path";
import { resolve } from "path";

export default {
  root: "src/",
  publicDir: "../static/",
  base: "/",
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
        main: resolve(__dirname, "src/index.html"),
        dashboard: resolve(__dirname, "src/dashboard.html"),
        decision_maker: resolve(__dirname, "src/decision_maker.html"),
      },
    },
  },
  // Custom plugin to handle clean URLs
  plugins: [
    {
      name: "custom-routes",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Only handle exact path matches for HTML routes
          if (req.url === "/dashboard") {
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
              return;
            } catch (err) {
              next();
              return;
            }
          }

          if (req.url === "/decision_maker") {
            const decisionMakerPath = path.join(
              process.cwd(),
              "src",
              "decision_maker.html"
            );

            try {
              const content = fs.readFileSync(decisionMakerPath, "utf8");
              res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
              });
              res.end(content);
              return;
            } catch (err) {
              next();
              return;
            }
          }

          // Let Vite handle all other requests
          next();
        });
      },
    },
  ],
};
