# 🎮 Dashboard Gamificado - Selvadentro Tulum

> Sistema de gamificación y gestión de performance para equipos de brokers en Real Estate

[![Status](https://img.shields.io/badge/Status-MVP%20Complete-success)](docs/MVP-RESUMEN-FINAL.md)
[![GoHighLevel](https://img.shields.io/badge/Integration-GoHighLevel-blue)](docs/GHL-CONNECTION-SUCCESS.md)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](database/gamification-schema.sql)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)](docs/REACT-COMPONENTS-IMPLEMENTATION.md)

---

## 🎯 ¿Qué es esto?

Un sistema completo de gamificación que transforma la gestión de brokers en **Selvadentro Tulum** en una experiencia motivadora y medible. Incluye:

- 📱 **Dashboard Mobile** para brokers con puntos, niveles y logros
- 👔 **Dashboard Ejecutivo** para dirección con analytics del equipo
- 🔄 **Sync automático** con GoHighLevel cada 5 minutos
- 🏆 **Sistema de gamificación** con 5 niveles y achievements
- 📊 **KPIs en tiempo real** y proyecciones de crecimiento

---

## 🚀 Quick Start

### Para Dirección (Juan Esteban)

Si solo quieres ver qué hemos construido:

1. Lee el [**Resumen Ejecutivo**](docs/MVP-RESUMEN-FINAL.md) - Todo el proyecto en un documento
2. Ve el [**Dashboard Ejecutivo**](docs/EXECUTIVE-DASHBOARD.md) - Tu vista de dirección
3. Revisa los [**KPIs de Pablo Saracho**](docs/PABLO-SARACHO-KPIS-REAL-ESTATE.md) - Ejemplo real

### Para Desarrolladores

Si vas a implementar el proyecto:

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd mcp-dashboard-manager

# 2. Instalar dependencias
npm install

# 3. Configurar .env.local
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Ejecutar migrations en Supabase
psql $SUPABASE_DATABASE_URL -f database/gamification-schema.sql

# 5. Iniciar sync worker
node workers/ghl-sync-worker.js

# 6. Iniciar dev server (cuando implementes Next.js)
npm run dev
```

Ver [**Roadmap de Implementación**](docs/MVP-RESUMEN-FINAL.md#-roadmap-de-implementación) completo.

---

## 📚 Documentación

### Documentos Principales

| Documento | Descripción | Líneas |
|-----------|-------------|---------|
| [**MVP-RESUMEN-FINAL.md**](docs/MVP-RESUMEN-FINAL.md) | 📋 Resumen ejecutivo completo del proyecto | 800+ |
| [**MVP-BROKER-DASHBOARD-GAMIFICATION.md**](docs/MVP-BROKER-DASHBOARD-GAMIFICATION.md) | 🎮 Sistema de gamificación y diseño UI | 500+ |
| [**API-IMPLEMENTATION.md**](docs/API-IMPLEMENTATION.md) | 🔌 API routes y backend | 600+ |
| [**REACT-COMPONENTS-IMPLEMENTATION.md**](docs/REACT-COMPONENTS-IMPLEMENTATION.md) | ⚛️ Componentes React mobile | 800+ |
| [**EXECUTIVE-DASHBOARD.md**](docs/EXECUTIVE-DASHBOARD.md) | 👔 Dashboard ejecutivo | 700+ |

### Documentos de Datos

| Documento | Descripción |
|-----------|-------------|
| [**PABLO-SARACHO-KPIS-REAL-ESTATE.md**](docs/PABLO-SARACHO-KPIS-REAL-ESTATE.md) | KPIs actuales de Pablo Saracho |
| [**GHL-CONNECTION-SUCCESS.md**](docs/GHL-CONNECTION-SUCCESS.md) | Conexión exitosa con GoHighLevel |
| [**GHL-USERS-STAFF.md**](docs/GHL-USERS-STAFF.md) | 17 usuarios del equipo extraídos |

### Código Fuente

| Archivo | Descripción | Líneas |
|---------|-------------|---------|
| [`database/gamification-schema.sql`](database/gamification-schema.sql) | Schema PostgreSQL completo | 400+ |
| [`workers/ghl-sync-worker.js`](workers/ghl-sync-worker.js) | Worker de sincronización | 450+ |
| [`scripts/get-agent-kpis.js`](scripts/get-agent-kpis.js) | Script de KPIs de agente | 395+ |

**Total**: ~5,500+ líneas de código y documentación

---

## 🎨 Sistema de Puntuación

### Presentaciones (1-5 puntos)

| Tipo | Puntos |
|------|--------|
| 🟦 Zoom con Brokers | 1 |
| 🟦 Eventos con Brokers | 1 |
| 🟪 Zoom con Inmobiliarias | 2 |
| 🟪 Zoom Cliente Final | 3 |
| 🟩 Física con Brokers | 3 |
| 🟩 Física con Inmobiliarias | 4 |
| 🟩 Física Cliente Final | 5 |

### Resultados (5-10 puntos)

| Tipo | Puntos |
|------|--------|
| 🟨 Venta Alianza con Broker | 5 |
| 🟧 Apartado | 10 |
| 🟧 Venta Propia | 10 |

---

## 🏆 Niveles de Brokers

| Nivel | Puntos | Comisión | Beneficios Clave |
|-------|--------|----------|------------------|
| 🔹 **Rookie** | 0-100 | 3.0% | Acceso básico |
| 🟢 **Junior** | 101-300 | 3.5% | Asistente virtual, Leads premium |
| 🔵 **Senior** | 301-600 | 4.0% | Asistente dedicado, VIP |
| 🟣 **Elite** | 601-1K | 4.5% | Equipo propio, Bonos |
| 🟡 **Legend** | 1K+ | 5.0% | Equity, Partner |

---

## 🎖️ Achievements Disponibles

1. **📞 Call Machine** - 100 llamadas en un mes
2. **🎤 Presenter Pro** - 50 presentaciones completadas
3. **💰 The Closer** - 10 ventas cerradas
4. **⚡ Flash Responder** - Tiempo de respuesta < 15 min
5. **🔥 Hot Streak** - 5 ventas en una semana
6. **📈 Top 3** - Posición en top 3 del ranking
7. **💯 Perfect Score** - 100% de leads contactados
8. **🌟 Rising Star** - Mayor crecimiento del mes

---

## 📊 KPIs Monitoreados

### Por Broker
- ✅ Leads asignados y contactados
- ✅ Llamadas diarias
- ✅ Presentaciones semanales
- ✅ Tasa de conversión
- ✅ Ventas del mes
- ✅ Revenue generado
- ✅ Puntos acumulados
- ✅ Nivel actual

### Para Dirección
- ✅ Performance del equipo completo
- ✅ Alertas de bajo rendimiento
- ✅ Top performers
- ✅ Tendencias de actividad
- ✅ Pipeline de conversión
- ✅ Revenue total
- ✅ Proyecciones de cierre

---

## 🔗 Integraciones

### GoHighLevel API
- ✅ Extracción de contactos
- ✅ Extracción de oportunidades
- ✅ Extracción de reuniones
- ✅ Sincronización cada 5 minutos
- ✅ 7 brokers monitoreados

### Supabase
- ✅ PostgreSQL database
- ✅ Row Level Security
- ✅ Real-time subscriptions
- ✅ Auth integration

### Next.js 15
- ✅ App Router
- ✅ Server Components
- ✅ API Routes
- ✅ Edge Functions

---

## 👥 Equipo Selvadentro Tulum

### Dirección
- **Juan Esteban Camara** - Director General (d.general@selvadentrotulum.com)
- **Omar Curi** - Director Comercial (d.comercial@selvadentrotulum.com)

### Brokers Activos (7)
1. Omar Curi - Elite
2. Pablo Saracho - Junior
3. Raquel Reyes - Elite
4. Mafer Cienfuegos - Senior
5. Mariano Molina - Junior
6. Gonzalo Caro - Junior
7. Jaqueline Selvadentro - Rookie

---

## 📈 Estado del Proyecto

### ✅ Completado (75%)

- [x] Investigación y análisis de GHL
- [x] Conexión con API de GoHighLevel
- [x] Extracción de usuarios y datos
- [x] Diseño del sistema de gamificación
- [x] Schema de base de datos completo
- [x] API Backend (4 endpoints)
- [x] Sync worker automatizado
- [x] Componentes React mobile (7)
- [x] Dashboard ejecutivo (6 componentes)
- [x] Documentación completa

### ⏳ Pendiente (25%)

- [ ] Testing unitario e integración
- [ ] Implementación en Next.js
- [ ] Deploy a producción
- [ ] Notificaciones push
- [ ] Capacitación de usuarios

---

## 🛠️ Stack Tecnológico

### Backend
- Node.js 20+
- Next.js 15 API Routes
- Supabase PostgreSQL
- GoHighLevel API v2

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### DevOps
- Vercel (hosting)
- PM2 (worker management)
- GitHub Actions (CI/CD)

---

## 📞 Contacto y Soporte

### Desarrollador
- **Roger García Vital**
- Email: rgarciavital@gmail.com
- ID GHL: XpV3Pz9INSFZs3AXnkFe

### Cliente
- **Selvadentro Tulum**
- Location ID: crN2IhAuOBAl7D8324yI
- Director: Juan Esteban Camara

---

## 🗺️ Próximos Pasos

### Esta Semana
1. Setup inicial de Next.js
2. Ejecutar migrations en Supabase
3. Implementar API routes
4. Testing con datos reales

### Próxima Semana
1. Implementar componentes React
2. Testing end-to-end
3. Deploy a staging
4. Demo para dirección

Ver el [**Roadmap completo**](docs/MVP-RESUMEN-FINAL.md#-roadmap-de-implementación) con timeline de 5 semanas.

---

## 📄 Licencia

Proyecto privado para **Selvadentro Tulum**.
Todos los derechos reservados © 2025.

---

## 🎉 Demo y Screenshots

Ver ejemplos visuales en [MVP-BROKER-DASHBOARD-GAMIFICATION.md](docs/MVP-BROKER-DASHBOARD-GAMIFICATION.md)

---

**Última actualización**: 2025-10-30
**Versión**: 1.0.0-MVP
**Estado**: ✅ MVP Completo - Listo para Implementación
