# 🚀 Guía de Deploy

## Arquitectura

- **Frontend (Vercel)**: React + Vite
- **Backend (Railway)**: Node.js + Puppeteer

---

## 📦 Deploy del Backend en Railway

### 1. Instala Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login en Railway
```bash
railway login
```

### 3. Crea un nuevo proyecto
```bash
railway init
```

### 4. Despliega el backend
```bash
railway up
```

### 5. Obtén la URL del servicio
```bash
railway status
```

Railway te dará una URL como: `https://tu-proyecto.railway.app`

### 6. Configura el puerto (si es necesario)
Railway automáticamente detecta el puerto 3001, pero si necesitas configurarlo:
```bash
railway variables set PORT=3001
```

---

## 🎨 Deploy del Frontend en Vercel

### 1. Instala Vercel CLI
```bash
npm install -g vercel
```

### 2. Login en Vercel
```bash
vercel login
```

### 3. Crea archivo .env.production
```bash
echo "VITE_API_URL=https://tu-proyecto.railway.app/api" > .env.production
```
**⚠️ Reemplaza** `tu-proyecto.railway.app` con tu URL real de Railway.

### 4. Despliega a Vercel
```bash
vercel
```

### 5. Configura la variable de entorno en Vercel Dashboard
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings > Environment Variables
4. Agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://tu-proyecto.railway.app/api`
   - **Environment**: Production

### 6. Redeploy
```bash
vercel --prod
```

---

## 🔧 Deploy Alternativo: Todo desde el Dashboard

### Railway (Backend)
1. Ve a https://railway.app
2. Click en "New Project" > "Deploy from GitHub Repo"
3. Selecciona `Embedded-website-tester`
4. Railway detecta automáticamente `railway.json`
5. El servicio se despliega automáticamente
6. Copia la URL del dominio generado

### Vercel (Frontend)
1. Ve a https://vercel.com
2. Click en "Import Project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Agrega la variable de entorno:
   - `VITE_API_URL=https://tu-backend.railway.app/api`
6. Click "Deploy"

---

## ✅ Verificación

Una vez desplegado:

1. Abre tu URL de Vercel
2. Debería ver la interfaz cargando
3. Si dice "No conectado", verifica:
   - ✅ Backend de Railway está corriendo
   - ✅ La variable `VITE_API_URL` está correcta en Vercel
   - ✅ CORS está habilitado en el backend (ya lo está)

---

## 🔄 Updates futuros

### Backend (Railway)
```bash
git add .
git commit -m "Update backend"
git push
# Railway redespliega automáticamente
```

### Frontend (Vercel)
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel redespliega automáticamente
```

---

## 💰 Costos

- **Vercel**: Free tier (100 GB bandwidth/mes)
- **Railway**: $5/mes después de créditos gratis ($5 iniciales)

---

## 🐛 Troubleshooting

### "Failed to connect to backend"
- Verifica que Railway esté corriendo: `railway logs`
- Chequea la URL en Vercel environment variables

### "Puppeteer error"
Railway tiene Chromium preinstalado. Si hay problemas:
```bash
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
railway variables set PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### "CORS errors"
Ya está configurado en `puppeteer-server.js`, pero si hay problemas:
```javascript
app.use(cors({
  origin: ['https://tu-frontend.vercel.app', 'http://localhost:5173']
}));
```
