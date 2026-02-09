import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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
    try {
      const res = await fetch(`${API}/screenshot`)
      const data = await res.json()
      if (data.success) {
        setScreenshot(data.image)
        setPageTitle(data.title || '')
        setPageUrl(data.url || '')
        if (!connected) setConnected(true)
      }
    } catch {
      setConnected(false)
    }
  }, [connected])

  // Navegar
  const navigate = async (targetUrl) => {
    const navUrl = targetUrl || url
    setLoading(true)
    setStatus('Navegando...')
    try {
      const res = await fetch(`${API}/navigate?url=${encodeURIComponent(navUrl)}`)
      const data = await res.json()
      if (data.success) {
        setPageTitle(data.title)
        setPageUrl(data.url)
        setUrl(data.url)
        setStatus('')
        await takeScreenshot()
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch {
      setStatus('No se puede conectar. Ejecuta: npm run puppet')
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

    await fetch(`${API}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    }).catch(() => {})
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
    try {
      const res = await fetch(`${API}/inject-css`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ css: cssCode }),
      })
      const data = await res.json()
      setStatus(data.success ? '✅ CSS inyectado' : `❌ ${data.error}`)
      await takeScreenshot()
    } catch (err) {
      setStatus(`❌ ${err.message}`)
    }
  }

  // Inyectar JS
  const injectJS = async () => {
    try {
      const res = await fetch(`${API}/inject-js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ js: jsCode }),
      })
      const data = await res.json()
      setStatus(data.success ? `✅ JS ejecutado → ${data.result}` : `❌ ${data.error}`)
      await takeScreenshot()
    } catch (err) {
      setStatus(`❌ ${err.message}`)
    }
  }

  // Limpiar inyecciones
  const removeInjected = async () => {
    await fetch(`${API}/remove-injected`, { method: 'POST' }).catch(() => {})
    setStatus('🧹 CSS limpiado')
    await takeScreenshot()
  }

  // Auto-refresh screenshots
  useEffect(() => {
    takeScreenshot()
    const interval = setInterval(takeScreenshot, 2000)
    return () => clearInterval(interval)
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
              <p>Ejecuta en otra terminal:</p>
              <code>npm run puppet</code>
              <p>Luego recarga esta página.</p>
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
