/**
 * Plugin de Vite que actúa como proxy reverso completo.
 * - Fetch del contenido de costplusdrugs.com
 * - Reescribe URLs absolutas para que pasen por /proxy
 * - Elimina headers de seguridad (X-Frame-Options, CSP)
 * - Sirve todo desde el mismo origen (localhost)
 */
export default function proxyPlugin(targetOrigin = 'https://www.costplusdrugs.com') {
  return {
    name: 'full-reverse-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy', async (req, res) => {
        const targetPath = req.url || '/';
        const targetUrl = `${targetOrigin}${targetPath}`;

        console.log(`[proxy] ${req.method} ${targetUrl}`);

        try {
          const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': req.headers.accept || '*/*',
              'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
              'Referer': targetOrigin + '/',
            },
            redirect: 'follow',
          });

          // Copiar headers relevantes de la respuesta
          const contentType = response.headers.get('content-type') || 'application/octet-stream';
          const cacheControl = response.headers.get('cache-control');

          res.setHeader('Content-Type', contentType);
          if (cacheControl) res.setHeader('Cache-Control', cacheControl);
          res.statusCode = response.status;

          // NO enviar headers de seguridad que bloquean embedding
          // (no copiamos x-frame-options, content-security-policy, etc.)

          // Para HTML, CSS y JS: reescribir URLs absolutas
          if (
            contentType.includes('text/html') ||
            contentType.includes('text/css') ||
            contentType.includes('javascript') ||
            contentType.includes('application/json')
          ) {
            let text = await response.text();

            // Reescribir todas las URLs absolutas al target
            text = text.replaceAll(`https://www.costplusdrugs.com`, '/proxy');
            text = text.replaceAll(`https:\\/\\/www.costplusdrugs.com`, '\\/proxy');
            text = text.replaceAll(`//www.costplusdrugs.com`, '/proxy');

            // Si es HTML, inyectar un <base> tag para resolver URLs relativas
            if (contentType.includes('text/html')) {
              text = text.replace('<head>', `<head><base href="/proxy/">`);
            }

            res.end(text);
          } else {
            // Contenido binario (imágenes, fuentes, etc.) - pasar directo
            const buffer = Buffer.from(await response.arrayBuffer());
            res.end(buffer);
          }
        } catch (err) {
          console.error('[proxy] Error:', err.message);
          res.statusCode = 502;
          res.end(`Proxy error: ${err.message}`);
        }
      });
    }
  };
}
