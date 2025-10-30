# Guía de Deployment en Vercel

Esta guía te ayudará a desplegar tu MCP Dashboard Manager en Vercel aprovechando todas sus capacidades.

## Prerrequisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com) con tu proyecto configurado
- Repositorio Git (GitHub, GitLab, o Bitbucket)

## Configuración Local

Ya tienes configurado el proyecto localmente con las credenciales de Supabase en `.env.local`.

### Variables de Entorno Locales

El archivo `.env.local` contiene:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mmxkcsqflbqzgsekxiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pasos para Deployment

### 1. Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados:

```bash
git add .
git commit -m "feat: Configure project for Vercel deployment"
git push origin main
```

### 2. Conectar con Vercel

#### Opción A: Desde la Web UI (Recomendado)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "Add New Project"
3. Importa tu repositorio de Git
4. Vercel detectará automáticamente que es un proyecto Next.js

#### Opción B: Usando Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login en Vercel
vercel login

# Deploy (desde el directorio del proyecto)
vercel
```

### 3. Configurar Variables de Entorno en Vercel

Durante el setup o después en Project Settings → Environment Variables, agrega:

#### Variables de Producción:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mmxkcsqflbqzgsekxiwp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teGtjc3FmbGJxemdzZWt4aXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODQ3MTAsImV4cCI6MjA3NzM2MDcxMH0.iW1ZO8_XYjf5HO6Ozuyo1rpZ_TEdG_rYA-J7WGoZCrU` |

**Importante:**
- Estas variables son públicas (NEXT_PUBLIC_*) y pueden exponerse en el cliente
- Si necesitas variables secretas (como SUPABASE_SERVICE_ROLE_KEY), NO uses el prefijo NEXT_PUBLIC_

### 4. Configuración del Build

Vercel usará automáticamente:
- **Build Command:** `npm run build` (definido en package.json)
- **Output Directory:** `.next` (por defecto en Next.js)
- **Install Command:** `npm install`

### 5. Deploy

Una vez configurado todo:

```bash
# Deploy a producción
vercel --prod
```

O simplemente haz push a tu rama principal y Vercel desplegará automáticamente.

## Verificación Post-Deploy

1. Vercel te dará una URL (ej: `https://mcp-dashboard-manager.vercel.app`)
2. Verifica que la app cargue correctamente
3. Prueba la conexión con Supabase
4. Verifica que todas las funcionalidades trabajen

## Características de Vercel que Aprovechas

### 1. Automatic Deployments
- Cada push a main despliega automáticamente
- Preview deployments para cada PR

### 2. Edge Network
- Tu app se sirve desde el CDN de Vercel globalmente
- Baja latencia en todo el mundo

### 3. Analytics (Opcional)
Habilita Vercel Analytics para métricas:
```bash
npm i @vercel/analytics
```

Luego en tu [layout.tsx](app/layout.tsx):
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 4. Server Components & API Routes
Ahora puedes crear API routes en `app/api/` si necesitas lógica del servidor.

## Troubleshooting

### Error: Module not found
```bash
# Limpia caché y reinstala
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Variables de entorno no funcionan
- Verifica que tengan el prefijo `NEXT_PUBLIC_` para variables del cliente
- Redeploy después de cambiar variables en Vercel

### Build fails
- Revisa los logs en Vercel Dashboard
- Verifica que `npm run build` funcione localmente
- Confirma que todas las dependencias estén en `dependencies` (no en `devDependencies`)

## Domains Personalizados

Para agregar un dominio personalizado:

1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Configura los DNS records según las instrucciones de Vercel

## Monitoreo y Logs

- **Deployment Logs:** Vercel Dashboard → Deployments
- **Runtime Logs:** Vercel Dashboard → Functions → View Logs
- **Analytics:** Habilita Vercel Analytics para métricas de usuarios

## Rollback

Si algo sale mal:

1. Ve a Vercel Dashboard → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Click en los tres puntos → "Promote to Production"

## Siguiente Nivel

### Edge Functions
Puedes crear Edge Functions para lógica que se ejecute en el edge:

```typescript
// app/api/hello/route.ts
export const runtime = 'edge';

export async function GET() {
  return new Response('Hello from the Edge!');
}
```

### Middleware
Crea [middleware.ts](middleware.ts) en la raíz para lógica que se ejecute antes de cada request:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Tu lógica aquí
  return NextResponse.next();
}
```

## Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase con Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Comandos Útiles

```bash
# Ver status del proyecto
vercel

# Deploy a preview
vercel

# Deploy a production
vercel --prod

# Ver logs en tiempo real
vercel logs

# Remover proyecto
vercel remove [project-name]
```

## Notas Importantes

1. **Costo:** El plan gratuito de Vercel es generoso y suficiente para la mayoría de proyectos
2. **Build Time:** Vercel tiene límites en el plan gratuito (6 horas/mes)
3. **Bandwidth:** 100GB/mes en el plan gratuito
4. **Edge Functions:** 100,000 invocaciones/mes gratis

¡Tu aplicación ahora está lista para ser desplegada en Vercel! 🚀
