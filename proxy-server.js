import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Configurar el proxy para costplusdrugs.com
app.use('/proxy', createProxyMiddleware({
  target: 'https://www.costplusdrugs.com',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // eliminar /proxy del path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Eliminar headers que bloquean el embedding
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

app.listen(PORT, () => {
  console.log(`\n🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying: http://localhost:${PORT}/proxy -> https://www.costplusdrugs.com\n`);
});
