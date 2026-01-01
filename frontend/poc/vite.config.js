import { defineConfig } from 'vite';
import httpProxy from 'http-proxy';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5173', // Placeholder, overwriten by middleware
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
                configure: (proxy, options) => {
                    // Default Vite proxy doesn't handle dynamic targets well,
                    // so we use the custom middleware below for /api/
                }
            }
        }
    },
    plugins: [{
        name: 'dynamic-proxy',
        configureServer(server) {
            const proxy = httpProxy.createProxyServer({
                changeOrigin: true,
                secure: false
            });

            server.middlewares.use((req, res, next) => {
                if (req.url.startsWith('/api/')) {
                    const target = req.headers['x-jira-url'];
                    if (!target) {
                        res.statusCode = 400;
                        res.end('Missing X-Jira-Url header');
                        return;
                    }

                    // Rewrite URL: remove /api
                    req.url = req.url.replace(/^\/api/, '');

                    proxy.web(req, res, { target }, (e) => {
                        console.error('Proxy error:', e);
                        res.statusCode = 502;
                        res.end(`Proxy error: ${e.message}`);
                    });
                } else {
                    next();
                }
            });
        }
    }]
});
