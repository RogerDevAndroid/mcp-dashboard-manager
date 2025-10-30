# Deploy a Netlify - Guía Completa

## 🚀 Opción 1: Deploy Automático desde GitHub (Recomendado)

### Paso 1: Ir a Netlify

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Inicia sesión o crea una cuenta

### Paso 2: Import from Git

1. Click en **"Add new site"** → **"Import an existing project"**
2. Selecciona **GitHub**
3. Autoriza Netlify a acceder a tu repositorio
4. Busca y selecciona `mcp-dashboard-manager`

### Paso 3: Configuración de Build

Netlify detectará automáticamente la configuración de `netlify.toml`, pero verifica:

```
Build command: npm run build
Publish directory: out
Node version: 18
```

### Paso 4: Deploy

1. Click en **"Deploy site"**
2. Espera 2-3 minutos mientras se construye
3. ¡Listo! Tu sitio estará en `https://[random-name].netlify.app`

---

## 🔧 Opción 2: Deploy Manual con Netlify CLI

### Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Login

```bash
netlify login
```

### Build y Deploy

```bash
# Build el proyecto
npm run build

# Deploy
netlify deploy --prod --dir=out
```

---

## 🎨 Personalizar el Dominio

### En Netlify Dashboard:

1. Ve a **Site settings** → **Domain management**
2. Click en **"Add custom domain"**
3. Sigue las instrucciones para configurar DNS

Dominios sugeridos:
- `mcp-dashboard.tu-dominio.com`
- `dashboard.tu-dominio.com`
- `mcps.tu-dominio.com`

---

## ⚡ Deploy desde este Directorio

Si estás en `/root/rogervibes/mcp-dashboard`:

```bash
# 1. Instalar dependencias
npm install

# 2. Build
npm run build

# 3. Test local (opcional)
npx serve out

# 4. Deploy con Netlify CLI
netlify deploy --prod --dir=out
```

---

## 🔐 Variables de Entorno (Opcional)

Si necesitas configurar variables de entorno:

1. En Netlify Dashboard → **Site settings** → **Environment variables**
2. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📊 Estado del Build

Tu dashboard incluye:
- ✅ Página principal interactiva
- ✅ MCPs management page
- ✅ Agents configuration page
- ✅ Analytics dashboard
- ✅ Responsive design
- ✅ Dark theme optimizado
- ✅ Animaciones y transiciones

---

## 🐛 Troubleshooting

### Error: "Build failed"

```bash
# Limpia y rebuild
rm -rf node_modules .next out
npm install
npm run build
```

### Error: "Module not found"

```bash
# Verifica que todas las dependencias estén instaladas
npm install
```

### El sitio se ve roto

- Verifica que el build command sea `npm run build`
- Verifica que publish directory sea `out`
- Asegúrate de que `output: 'export'` esté en next.config.mjs

---

## 🎯 URLs de tu Dashboard

Después del deploy, tu dashboard estará disponible en:

- **Home**: `/` - Dashboard principal
- **MCPs**: `/mcps` - Gestión de MCP Servers
- **Agents**: `/agents` - Agentes especializados
- **Analytics**: `/analytics` - Métricas y estadísticas

---

## 🔄 Re-deploy Automático

Netlify está configurado para re-deployar automáticamente cuando:
- Haces push a la rama `main`
- Merge un Pull Request
- Editas directamente en GitHub

---

## 📱 Preview Deployments

Netlify crea previews automáticos para:
- Pull Requests
- Branches

Accede a ellos en: **Deploys** tab en Netlify Dashboard

---

## ⚙️ Configuración Avanzada

### Redirects y Rewrites

Ya configurados en `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Headers

Puedes agregar headers custom en `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

## 🎉 ¡Listo!

Tu dashboard está ahora desplegado y accesible desde cualquier lugar.

**Próximos pasos:**
1. Personaliza el dominio
2. Configura variables de entorno
3. Conecta con tu Supabase backend
4. Invita a tu equipo

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de build en Netlify
2. Verifica la [documentación de Netlify](https://docs.netlify.com)
3. Consulta los [foros de Next.js](https://github.com/vercel/next.js/discussions)
