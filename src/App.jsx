import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

console.log('🔍 DEBUG - Variables de entorno:')
console.log('  import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('  API constante final:', API)
console.log('  Todas las env vars:', import.meta.env)

function App() {
  const [url, setUrl] = useState('https://www.costplusdrugs.com')
  const [status, setStatus] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [activeTab, setActiveTab] = useState('css')
  const imgRef = useRef(null)

  const [cssCode, setCssCode] = useState(`/* Ejemplo: ocultar el header */
header, nav {
  display: none !important;
}

/* Cambiar fondo */
body {
  background: #1a1a2e !important;
}`)

  const [jsCode, setJsCode] = useState(`// Ejemplo: agregar banner
const banner = document.createElement('div');
banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4444;color:white;padding:12px;z-index:99999;text-align:center;font-weight:bold';
banner.textContent = 'Script Inyectado';
document.body.prepend(banner);`)

  // Screenshot
  const takeScreenshot = useCallback(async () => {
    console.log('📸 Tomando screenshot...')
    console.log('  URL completa:', `${API}/screenshot`)
    try {
      const res = await fetch(`${API}/screenshot`)
      console.log('  Respuesta screenshot status:', res.status)
      const data = await res.json()
      console.log('  Data screenshot:', data)
      if (data.success) {
        setScreenshot(data.image)
        setPageTitle(data.title || '')
        setPageUrl(data.url || '')
        if (!connected) {
          console.log('✅ Conectado!')
          setConnected(true)
        }
      }
    } catch (err) {
      console.error('❌ Error en screenshot:', err)
      setConnected(false)
    }
  }, [connected])

  // Navegar
  const navigate = async (targetUrl) => {
    const navUrl = targetUrl || url
    console.log('🚀 Navegando a:', navUrl)
    console.log('  API URL completa:', `${API}/navigate?url=${encodeURIComponent(navUrl)}`)
    setLoading(true)
    setStatus('Navegando...')
    try {
      const res = await fetch(`${API}/navigate?url=${encodeURIComponent(navUrl)}`)
      console.log('  Respuesta navigate status:', res.status)
      console.log('  Respuesta navigate ok:', res.ok)
      const data = await res.json()
      console.log('  Data navigate:', data)
      if (data.success) {
        console.log('✅ Navegación exitosa')
        setPageTitle(data.title)
        setPageUrl(data.url)
        setUrl(data.url)
        setStatus('')
        await takeScreenshot()
      } else {
        console.error('❌ Error en respuesta:', data.error)
        setStatus(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('❌ Error en navigate:', err)
      console.error('  Tipo:', err.name)
      console.error('  Mensaje:', err.message)
      console.error('  Stack:', err.stack)
      const isDev = !import.meta.env.VITE_API_URL
      console.log('  Es desarrollo?:', isDev)
      setStatus(isDev 
        ? 'No se puede conectar. Ejecuta: npm run puppet' 
        : 'Error de conexión con el servidor. Verifica la configuración.')
    }
    setLoading(false)
  }

  // Click en la imagen → click en el navegador
  const handleClick = async (e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const scaleX = 1280 / rect.width
    const scaleY = 900 / rect.height
    const x = Math.round((e.clientX - rect.left) * scaleX)
    const y = Math.round((e.clientY - rect.top) * scaleY)

    console.log('🖱️ Click en:', { x, y })
    console.log('  API URL:', `${API}/click`)
    await fetch(`${API}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    }).catch((err) => console.error('❌ Error en click:', err))
    setTimeout(takeScreenshot, 500)
  }

  // Scroll en la imagen → scroll en el navegador
  const handleWheel = async (e) => {
    e.preventDefault()
    await fetch(`${API}/scroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaY: e.deltaY }),
    }).catch(() => {})
    setTimeout(takeScreenshot, 200)
  }

  // Atrás / Adelante
  const goBack = async () => {
    await fetch(`${API}/back`, { method: 'POST' }).catch(() => {})
    setTimeout(async () => { await takeScreenshot() }, 1000)
  }
  const goForward = async () => {
    await fetch(`${API}/forward`, { method: 'POST' }).catch(() => {})
    setTimeout(async () => { await takeScreenshot() }, 1000)
  }

  // Inyectar CSS
  const injectCSS = async () => {
    console.log('💅 Inyectando CSS...')
    console.log('  URL completa:', `${API}/inject-css`)
    console.log('  CSS code:', cssCode)
    try {
      const res = await fetch(`${API}/inject-css`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ css: cssCode }),
      })
      console.log('  Respuesta inject-css status:', res.status)
      const data = await res.json()
      console.log('  Data inject-css:', data)
      setStatus(data.success ? '✅ CSS inyectado' : `❌ ${data.error}`)
      await takeScreenshot()
    } catch (err) {
      console.error('❌ Error en injectCSS:', err)
      setStatus(`❌ ${err.message}`)
    }
  }

  // Inyectar JS
  const injectJS = async () => {
    console.log('⚡ Inyectando JS...')
    console.log('  URL completa:', `${API}/inject-js`)
    console.log('  JS code:', jsCode)
    try {
      const res = await fetch(`${API}/inject-js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ js: jsCode }),
      })
      console.log('  Respuesta inject-js status:', res.status)
      const data = await res.json()
      console.log('  Data inject-js:', data)
      setStatus(data.success ? `✅ JS ejecutado → ${data.result}` : `❌ ${data.error}`)
      await takeScreenshot()
    } catch (err) {
      console.error('❌ Error en injectJS:', err)
      setStatus(`❌ ${err.message}`)
    }
  }

  // Limpiar inyecciones
  const removeInjected = async () => {
    await fetch(`${API}/remove-injected`, { method: 'POST' }).catch(() => {})
    setStatus('🧹 CSS limpiado')
    await takeScreenshot()
  }

  // Debug inicial
  useEffect(() => {
    console.log('🎯 Componente montado')
    console.log('  API constante:', API)
    console.log('  URL inicial:', url)
    console.log('  Connected:', connected)
  }, [])

  // Auto-refresh screenshots
  useEffect(() => {
    console.log('🔄 Iniciando auto-refresh de screenshots')
    takeScreenshot()
    const interval = setInterval(takeScreenshot, 2000)
    return () => {
      console.log('🛑 Deteniendo auto-refresh')
      clearInterval(interval)
    }
  }, [takeScreenshot])

  return (
    <div className="app">
      {/* ── Barra de navegación tipo browser ── */}
      <div className="browser-bar">
        <div className="nav-buttons">
          <button onClick={goBack} className="nav-btn" title="Atrás">←</button>
          <button onClick={goForward} className="nav-btn" title="Adelante">→</button>
          <button onClick={() => navigate()} className="nav-btn" title="Recargar">↻</button>
        </div>
        <div className="url-bar">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate()}
            placeholder="Ingresa una URL..."
            className="url-input"
          />
        </div>
        <div className="bar-actions">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`inject-toggle ${showPanel ? 'active' : ''}`}
            title="Panel de inyección"
          >
            {showPanel ? '✕' : '💉'}
          </button>
          <span className={`status-dot ${connected ? 'connected' : ''}`} title={connected ? 'Conectado' : 'Desconectado'} />
        </div>
      </div>

      {/* ── Status bar ── */}
      {status && (
        <div className="status-bar">{status}</div>
      )}

      {/* ── Contenido principal ── */}
      <div className="main-area">
        {/* Panel de inyección (lateral) */}
        {showPanel && (
          <div className="inject-panel">
            <div className="panel-tabs">
              <button
                className={`tab ${activeTab === 'css' ? 'active' : ''}`}
                onClick={() => setActiveTab('css')}
              >
                🎨 CSS
              </button>
              <button
                className={`tab ${activeTab === 'js' ? 'active' : ''}`}
                onClick={() => setActiveTab('js')}
              >
                ⚡ JS
              </button>
            </div>

            {activeTab === 'css' ? (
              <div className="panel-content">
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  placeholder="CSS..."
                  className="code-editor"
                  spellCheck={false}
                />
                <div className="panel-actions">
                  <button onClick={injectCSS} className="btn-inject">Inyectar CSS</button>
                  <button onClick={removeInjected} className="btn-clean">Limpiar</button>
                </div>
              </div>
            ) : (
              <div className="panel-content">
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  placeholder="JavaScript..."
                  className="code-editor"
                  spellCheck={false}
                />
                <div className="panel-actions">
                  <button onClick={injectJS} className="btn-inject">Ejecutar JS</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista de la web (screenshot interactivo) */}
        <div className="web-view">
          {loading && <div className="loading-overlay">Cargando...</div>}
          {!connected ? (
            <div className="disconnected">
              <h2>🔌 Servidor no conectado</h2>
              {!import.meta.env.VITE_API_URL ? (
                <>
                  <p>Ejecuta en otra terminal:</p>
                  <code>npm run puppet</code>
                  <p>Luego recarga esta página.</p>
                </>
              ) : (
                <>
                  <p>No se puede conectar al servidor backend.</p>
                  <p>Verifica que la variable VITE_API_URL esté configurada correctamente.</p>
                </>
              )}
            </div>
          ) : screenshot ? (
            <img
              ref={imgRef}
              src={screenshot}
              alt="Web embebida"
              className="web-screenshot"
              onClick={handleClick}
              onWheel={handleWheel}
              draggable={false}
            />
          ) : (
            <div className="disconnected">
              <p>Cargando vista previa...</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer con info ── */}
      {connected && pageTitle && (
        <div className="info-footer">
          <span className="page-title">{pageTitle}</span>
          <span className="page-url">{pageUrl}</span>
        </div>
      )}
    </div>
  )
}

export default App
