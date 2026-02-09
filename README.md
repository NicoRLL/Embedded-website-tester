# 🔧 Embed & Script Injection - React Project

Proyecto React para embeber sitios web y experimentar con inyección de CSS y JavaScript.

## 🚀 Inicio Rápido

El servidor ya está corriendo en: **http://localhost:5173/**

## 📋 Características

- ✅ Embed de sitios web mediante iframe
- 💉 Inyección de CSS personalizado
- 💉 Ejecución de JavaScript en el iframe
- 🔍 Detección automática de restricciones CORS
- 🎨 Interfaz intuitiva con editor de código
- 📱 Panel de control lateral

## ⚠️ Limitaciones Importantes

### 1. **CORS Policy (Cross-Origin Resource Sharing)**
La mayoría de los sitios externos bloquean el acceso desde iframes de otros dominios por razones de seguridad:

```
❌ https://www.costplusdrugs.com - Probablemente bloqueado
❌ https://www.google.com - Bloqueado
❌ https://www.facebook.com - Bloqueado
```

### 2. **X-Frame-Options Header**
Muchos sitios previenen ser embebidos completamente:
```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

### 3. **Content Security Policy (CSP)**
Restringe la ejecución de scripts externos y modificaciones.

## ✅ Cómo Probar con Éxito

### Opción 1: Página de Prueba Local (Recomendado)
El proyecto incluye una página de prueba en:
```
http://localhost:5173/test-page.html
```

**Pasos:**
1. En el campo URL, ingresa: `http://localhost:5173/test-page.html`
2. Haz clic en "Cargar"
3. Verás "✅ ¡Acceso permitido! Puedes inyectar código"
4. Prueba los ejemplos de inyección

### Opción 2: Sitios que Permiten Embedding
Algunos sitios que podrían permitir embedding:
- `https://example.com`
- `https://wikipedia.org` (puede funcionar)
- Tu propio servidor con headers apropiados

### Opción 3: Servidor Proxy (Solución Profesional)
Para manipular sitios externos sin restricciones, necesitas un servidor proxy que:
1. Descargue el contenido del sitio
2. Remueva las restricciones de seguridad
3. Te lo sirva como si fuera propio

## 💡 Ejemplos de Inyección

### CSS - Invertir Colores
```css
body {
  filter: invert(1) hue-rotate(180deg) !important;
}
```

### CSS - Cambiar Fondo
```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

### JavaScript - Modificar Contenido
```javascript
// Cambiar título
document.title = "Página Modificada";

// Cambiar todos los h1
document.querySelectorAll('h1').forEach(h1 => {
  h1.style.color = 'red';
  h1.textContent = '¡Modificado!';
});
```

### JavaScript - Agregar Elemento
```javascript
const banner = document.createElement('div');
banner.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: red;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 20px;
  z-index: 9999;
`;
banner.textContent = '🎉 ¡Contenido Inyectado!';
document.body.appendChild(banner);
```

## 🛠️ Soluciones para Sitios Externos

### 1. Extensión de Navegador
Crea una extensión de Chrome/Firefox que:
- Tiene permisos para modificar cualquier página
- No tiene restricciones CORS
- Puede inyectar scripts en cualquier sitio

### 2. Servidor Proxy
```javascript
// Ejemplo conceptual con Express
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);
  const html = await response.text();
  // Modificar el HTML
  const modified = html.replace('</head>', 
    '<script>/* tu código */</script></head>');
  res.send(modified);
});
```

### 3. Puppeteer/Playwright
Para automatización y capturas:
```javascript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
await page.addStyleTag({ content: 'body { background: red; }' });
await page.screenshot({ path: 'modified.png' });
```

## 📁 Estructura del Proyecto

```
embed-website/
├── src/
│   ├── App.jsx          # Componente principal con iframe y controles
│   ├── App.css          # Estilos del componente
│   ├── index.css        # Estilos globales
│   └── main.jsx         # Punto de entrada
├── public/
│   └── test-page.html   # Página de prueba local
└── README.md            # Este archivo
```

## 🔧 Comandos Útiles

```bash
# Instalar dependencias (ya instaladas)
npm install

# Iniciar servidor de desarrollo (ya corriendo)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🎯 Casos de Uso Reales

1. **Testing Visual**: Probar cómo tu contenido se ve en diferentes contextos
2. **Dashboards**: Embeber múltiples fuentes en un panel
3. **Desarrollo de Extensiones**: Prototipo antes de crear una extensión de navegador
4. **Educación**: Aprender sobre seguridad web y CORS
5. **Herramientas Internas**: Cuando controlas ambos lados (iframe y contenedor)

## 📚 Recursos Adicionales

- [MDN - iframe](https://developer.mozilla.org/es/docs/Web/HTML/Element/iframe)
- [MDN - CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [Content Security Policy](https://developer.mozilla.org/es/docs/Web/HTTP/CSP)
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)

## 🤔 Preguntas Frecuentes

**P: ¿Por qué no puedo modificar costplusdrugs.com?**  
R: El sitio tiene protecciones CORS y X-Frame-Options que previenen el acceso desde otros dominios.

**P: ¿Es legal modificar sitios web de otros?**  
R: Modificar el contenido localmente para tu propia visualización es legal, pero redistribuir contenido modificado puede violar términos de servicio.

**P: ¿Cómo puedo hacer esto en producción?**  
R: Usa un servidor proxy que descargue y sirva el contenido, o crea una extensión de navegador.

## 🎨 Personalización

Modifica los estilos en `src/App.css` para cambiar la apariencia del panel de control.

---

**Hecho con ❤️ y React + Vite**


## 🌐 Deploy a Producción

Este proyecto se puede deployar en:
- **Frontend**: Vercel
- **Backend**: Railway

Lee la **[Guía de Deploy completa](DEPLOY.md)** para instrucciones detalladas.

### Quick Deploy

**Backend en Railway:**
```bash
railway login
railway init
railway up
```

**Frontend en Vercel:**
```bash
# Configura la variable de entorno primero
echo "VITE_API_URL=https://tu-proyecto.railway.app/api" > .env.production

vercel login
vercel --prod
```

Recuerda agregar `VITE_API_URL` como variable de entorno en Vercel Dashboard.

