import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let browser = null;
let page = null;

// Inicializar el navegador
async function initBrowser() {
  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1280,900',
    ],
    defaultViewport: { width: 1280, height: 900 },
  });

  page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log('🟢 Navegador iniciado (headless)');
}

// ─── NAVEGACIÓN ─────────────────────────────────────────

app.get('/api/navigate', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  try {
    console.log(`📡 Navegando a: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const title = await page.title();
    const currentUrl = page.url();
    res.json({ success: true, title, url: currentUrl });
  } catch (err) {
    // Aún si da timeout, la página puede haberse cargado parcialmente
    const title = await page.title().catch(() => '');
    res.json({ success: true, title, url: page.url(), warning: err.message });
  }
});

// ─── SCREENSHOT ─────────────────────────────────────────

app.get('/api/screenshot', async (req, res) => {
  try {
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'jpeg',
      quality: 75,
    });
    const title = await page.title().catch(() => '');
    const currentUrl = page.url();
    res.json({ success: true, image: `data:image/jpeg;base64,${screenshot}`, title, url: currentUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INTERACCIONES ──────────────────────────────────────

// Click en coordenadas
app.post('/api/click', async (req, res) => {
  const { x, y } = req.body;
  try {
    await page.mouse.click(x, y);
    // Esperar un poco para que la página reaccione
    await new Promise(r => setTimeout(r, 300));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scroll
app.post('/api/scroll', async (req, res) => {
  const { deltaX = 0, deltaY = 0 } = req.body;
  try {
    await page.mouse.wheel({ deltaX, deltaY });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tipear texto
app.post('/api/type', async (req, res) => {
  const { text } = req.body;
  try {
    await page.keyboard.type(text);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Presionar tecla
app.post('/api/key', async (req, res) => {
  const { key } = req.body;
  try {
    await page.keyboard.press(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Navegar atrás/adelante
app.post('/api/back', async (_req, res) => {
  try {
    await page.goBack({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/forward', async (_req, res) => {
  try {
    await page.goForward({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INYECCIÓN ──────────────────────────────────────────

app.post('/api/inject-css', async (req, res) => {
  const { css } = req.body;
  if (!css) return res.status(400).json({ error: 'CSS requerido' });

  try {
    await page.evaluate((cssCode) => {
      const style = document.createElement('style');
      style.setAttribute('data-injected', 'true');
      style.textContent = cssCode;
      document.head.appendChild(style);
    }, css);
    res.json({ success: true, message: 'CSS inyectado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inject-js', async (req, res) => {
  const { js } = req.body;
  if (!js) return res.status(400).json({ error: 'JS requerido' });

  try {
    const result = await page.evaluate((jsCode) => {
      try {
        const fn = new Function(jsCode);
        const r = fn();
        return { success: true, result: String(r ?? 'undefined') };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }, js);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/remove-injected', async (_req, res) => {
  try {
    await page.evaluate(() => {
      document.querySelectorAll('style[data-injected]').forEach((el) => el.remove());
    });
    res.json({ success: true, message: 'Estilos inyectados eliminados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATUS ─────────────────────────────────────────────

app.get('/api/status', async (_req, res) => {
  try {
    const title = await page.title().catch(() => '');
    const url = page.url();
    res.json({ success: true, title, url, ready: true });
  } catch {
    res.json({ success: false, ready: false });
  }
});

// ─── START ──────────────────────────────────────────────

async function start() {
  await initBrowser();
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor Puppeteer en http://localhost:${PORT}`);
    console.log(`   Listo para recibir comandos\n`);
  });
}

process.on('SIGINT', async () => {
  console.log('\n🔴 Cerrando navegador...');
  if (browser) await browser.close();
  process.exit(0);
});

start().catch(console.error);
