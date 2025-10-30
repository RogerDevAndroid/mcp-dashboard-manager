# MCP Dashboard - Interfaz Web Interactiva

Dashboard interactivo construido con Next.js 14 para gestionar MCPs, agentes y analytics.

## ✨ Features

### 🏠 Dashboard Principal
- Overview de todo el sistema
- Estadísticas en tiempo real
- Actividad reciente
- Quick actions

### 🔌 MCPs Page
- Lista de 30+ MCP Servers disponibles
- Búsqueda y filtros
- Estados de conexión (Active/Inactive)
- Configuración individual
- Onboarding integrado

### 🤖 Agents Page
- 8 agentes especializados
- Monitoreo de tareas
- MCPs utilizados por cada agente
- Estadísticas de rendimiento

### 📊 Analytics Page
- Métricas de uso
- Success rates
- Response times
- Usage over time charts
- Actividad por categoría

## 🎨 Diseño

- **Dark Theme** con gradientes modernos
- **Responsive** - funciona en móvil, tablet y desktop
- **Animaciones** suaves con Tailwind CSS
- **Iconos** de Heroicons
- **Glass morphism** effects

## 🚀 Deploy a Netlify (3 minutos)

### Método 1: Netlify UI (Más Fácil)

1. Ve a https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Conecta con GitHub
4. Selecciona `mcp-dashboard-manager`
5. ¡Click "Deploy"!

**Configuración automática:**
- Build command: `npm run build`
- Publish directory: `out`
- Node version: 18

### Método 2: Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=out
```

## 🔗 URLs del Dashboard

Una vez desplegado, tendrás acceso a:

- `/` - Dashboard principal
- `/mcps` - Gestión de MCPs
- `/agents` - Agentes especializados
- `/analytics` - Métricas y estadísticas

## 📱 Screenshots

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)
- Vista general del sistema
- Métricas clave
- Actividad reciente
- Quick actions

### MCPs Management
![MCPs](docs/screenshots/mcps.png)
- Lista completa de MCPs
- Búsqueda integrada
- Estados en tiempo real
- Configuración rápida

### Agents Configuration
![Agents](docs/screenshots/agents.png)
- Agentes especializados
- MCPs conectados
- Tareas completadas
- Control de estados

### Analytics Dashboard
![Analytics](docs/screenshots/analytics.png)
- Gráficas de uso
- Success rates
- Response times
- Distribución por categoría

## 🛠️ Desarrollo Local

### Instalar dependencias

```bash
npm install
```

### Ejecutar en dev mode

```bash
npm run dev
```

Dashboard disponible en: http://localhost:3000

### Build para producción

```bash
npm run build
```

Output en carpeta `out/`

## 🔧 Configuración

### Variables de Entorno (Opcional)

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Netlify Environment Variables

En Netlify Dashboard → Site settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 📦 Build Output

El build genera sitio estático optimizado:

```
out/
├── index.html          (Dashboard principal)
├── mcps.html          (MCPs page)
├── agents.html        (Agents page)
├── analytics.html     (Analytics page)
├── _next/
│   ├── static/
│   └── ...
└── ...
```

## 🎯 Optimizaciones

- ✅ Static export (SSG)
- ✅ Imágenes optimizadas
- ✅ Code splitting automático
- ✅ CSS minificado
- ✅ Lazy loading
- ✅ PWA ready

## 🔄 CI/CD

Auto-deploy configurado:
- ✅ Push a `main` → Deploy automático
- ✅ Pull Requests → Preview deployments
- ✅ Branch deploys

## 📊 Performance

Build time: ~30-40 segundos
Bundle size:
- First Load JS: 87.3 kB
- Páginas: 8-10 kB c/u

## 🐛 Troubleshooting

### Build Error

```bash
rm -rf node_modules .next out
npm install
npm run build
```

### El dashboard no carga

1. Verifica que el build fue exitoso
2. Revisa Netlify deploy logs
3. Asegúrate de que publish directory es `out`

### Estilos rotos

- Verifica que Tailwind está configurado correctamente
- Limpia cache: `rm -rf .next out`
- Rebuild: `npm run build`

## 🔐 Seguridad

- No expongas service_role keys en el frontend
- Usa solo anon keys públicas
- Configura Row Level Security en Supabase
- HTTPS forzado por Netlify

## 🌐 Custom Domain

En Netlify Dashboard:
1. Site settings → Domain management
2. Add custom domain
3. Configura DNS

Recomendados:
- `dashboard.tu-dominio.com`
- `mcp.tu-dominio.com`
- `app.tu-dominio.com`

## 📈 Analytics Integradas

Netlify proporciona:
- Page views
- Unique visitors
- Popular pages
- Geographic data

Accede en: Analytics tab en Netlify

## 🚀 Próximos Pasos

1. **Personaliza** el branding
2. **Conecta** con Supabase backend
3. **Agrega** más páginas
4. **Integra** autenticación
5. **Implementa** real-time updates

## 🤝 Soporte

Para issues del dashboard:
1. Revisa este README
2. Consulta DEPLOY-NETLIFY.md
3. Ve los logs en Netlify
4. Abre issue en GitHub

## 📝 Licencia

MIT - Ver LICENSE file

---

**Dashboard construido con:**
- Next.js 14
- Tailwind CSS
- TypeScript
- Heroicons
- Netlify

¡Disfruta tu dashboard! 🎉
