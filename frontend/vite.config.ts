import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import httpProxy from "http-proxy";
import path from "path";

// Dynamic proxy middleware for JIRA API requests
function dynamicProxyPlugin(): Plugin {
  const proxy = httpProxy.createProxyServer({});

  proxy.on("error", (err, _req, res) => {
    console.error("Proxy error:", err);
    if ("writeHead" in res && typeof res.writeHead === "function") {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy error", message: err.message }));
    }
  });

  // Log proxy responses for debugging
  proxy.on("proxyRes", (proxyRes, req) => {
    console.log(`[Vite Proxy Response] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
    if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
      console.log(`[Vite Proxy Response] Headers: ${JSON.stringify(proxyRes.headers)}`);
    }
  });

  return {
    name: "dynamic-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only proxy /api requests
        if (!req.url?.startsWith("/api")) {
          return next();
        }

        // Debug logging for proxy
        console.log(`[Vite Proxy] ${req.method} ${req.url}`);
        console.log(`[Vite Proxy] Content-Type: ${req.headers['content-type']}`);

        // Get target URL from header or use default backend
        const targetUrl =
          req.headers["x-jira-url"] || "http://localhost:8000";

        // Rewrite URL: remove /api prefix for external JIRA, keep for local backend
        let targetPath = req.url;
        if (
          req.headers["x-jira-url"] &&
          !String(req.headers["x-jira-url"]).includes("localhost")
        ) {
          // External JIRA - strip /api prefix
          targetPath = req.url.replace(/^\/api/, "");
        }

        proxy.web(req, res, {
          target: targetUrl as string,
          changeOrigin: true,
          selfHandleResponse: false,
          headers: {
            // Remove the custom header before forwarding
            "x-jira-url": "",
          },
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), dynamicProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
