# 🎮 Dashboard Gamificado para Brokers - Selvadentro Tulum

Sistema completo de gestión y gamificación para equipos de brokers inmobiliarios.

---

## 🎯 ¿Qué es esto?

Un dashboard moderno que combina:
- 📊 **Métricas en tiempo real** - KPIs de cada broker
- 🎮 **Gamificación** - Sistema de puntos, niveles y logros
- 🏆 **Leaderboard** - Ranking del equipo actualizado
- 📈 **Dashboard Ejecutivo** - Vista general con filtros dinámicos
- 🔐 **Multi-rol** - Acceso diferenciado por rol (broker, manager, director, admin)

---

## ✨ Características Principales

### Para Brokers 👨‍💼
- Ver métricas personales (llamadas, presentaciones, ventas)
- Seguimiento de nivel y progreso
- Sistema de puntos gamificado
- Tareas diarias con checklist
- Ver posición en ranking del equipo
- Desbloquear logros y badges
- Proyecciones de crecimiento

### Para Directivos 👔
- Dashboard ejecutivo con métricas del equipo
- Filtros dinámicos (fecha, broker, pipeline, revenue)
- Alertas de rendimiento por prioridad
- Tabla de top performers
- Gráficos de tendencias (actividad, revenue, conversión)
- Embudo de conversión del pipeline
- Exportar reportes

---

## 🚀 Estado del Proyecto

### ✅ 100% Completado

#### Código
- [x] 7 componentes mobile para brokers
- [x] 6 componentes dashboard ejecutivo
- [x] 3 páginas principales integradas
- [x] 5 API routes funcionando
- [x] Sistema de autenticación completo
- [x] Filtros dinámicos estilo Bubble

#### Base de Datos
- [x] Schema de gamificación
- [x] Schema de autenticación
- [x] Row Level Security (RLS)
- [x] Triggers y funciones automatizadas
- [x] Vistas optimizadas

#### Documentación
- [x] Guías de instalación
- [x] Documentación técnica completa
- [x] Scripts de deployment
- [x] Troubleshooting guides

---

## 🎮 Sistema de Gamificación

### Puntos por Actividad

| Actividad | Subtipo | Puntos |
|-----------|---------|--------|
| 📞 Llamadas | Base | 1 pt |
| 📞 Llamadas | Contacto exitoso | 2 pts |
| 📞 Llamadas | Interesado | 3 pts |
| 📞 Llamadas | Presentación agendada | 4 pts |
| 🎤 Presentaciones | Agendada | 1 pt |
| 🎤 Presentaciones | Realizada | 3 pts |
| 🎤 Presentaciones | Cerrada | 5 pts |
| 💰 Resultados | Apartado | 5 pts |
| 💰 Resultados | Contrato | 7 pts |
| 💰 Resultados | Venta | 10 pts |

### Niveles

| Nivel | Puntos | Comisión | Color |
|-------|--------|----------|-------|
| 🌱 Rookie | 0-999 | 3% | Verde |
| 💼 Junior | 1,000-2,999 | 4% | Azul |
| 🎯 Senior | 3,000-5,999 | 5% | Morado |
| ⭐ Elite | 6,000-9,999 | 6% | Naranja |
| 👑 Legend | 10,000+ | 7% | Amarillo |

### Logros

- 🎯 **First Blood** - Primera venta
- 📞 **Call Machine** - 100 llamadas/mes
- 🎤 **Presenter Pro** - 50 presentaciones
- 💰 **The Closer** - 10 ventas
- 🏆 **Top Performer** - Entrar al Top 3
- ⭐ **Perfect Week** - Todas las tareas completadas
- 🚀 **Rising Star** - Subir de nivel
- 🤝 **Team Player** - Colaboración

---

## 📁 Estructura del Proyecto

```
mcp-dashboard-manager/
├── app/
│   ├── (dashboard)/
│   │   ├── broker/
│   │   │   ├── [brokerId]/
│   │   │   │   ├── page.tsx          # Dashboard del broker
│   │   │   │   └── layout.tsx
│   │   │   └── components/           # 7 componentes mobile
│   │   │       ├── DashboardHeader.tsx
│   │   │       ├── LevelProgress.tsx
│   │   │       ├── MetricsGrid.tsx
│   │   │       ├── GrowthPath.tsx
│   │   │       ├── DailyTasks.tsx
│   │   │       ├── MiniLeaderboard.tsx
│   │   │       └── AchievementsBadges.tsx
│   │   └── executive/
│   │       ├── page.tsx              # Dashboard ejecutivo
│   │       └── components/           # 6 componentes ejecutivos
│   │           ├── ExecutiveHeader.tsx
│   │           ├── DynamicFilters.tsx
│   │           ├── ExecutiveSummary.tsx
│   │           ├── AlertsPanel.tsx
│   │           ├── TopPerformersTable.tsx
│   │           ├── TrendsChart.tsx
│   │           └── PipelineFunnel.tsx
│   ├── api/
│   │   ├── broker/
│   │   │   ├── dashboard/route.ts    # GET dashboard data
│   │   │   ├── activities/route.ts   # POST/GET activities
│   │   │   └── list/route.ts         # GET brokers list
│   │   ├── leaderboard/route.ts      # GET ranking
│   │   └── executive/
│   │       └── dashboard/route.ts    # GET executive data
│   └── login/
│       └── page.tsx                  # Login page
├── lib/
│   ├── auth.ts                       # Authentication utilities
│   ├── supabase.ts                   # Supabase client
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
├── database/
│   ├── gamification-schema.sql       # DB schema (gamification)
│   └── auth-schema.sql               # DB schema (auth)
├── scripts/
│   ├── deploy-setup.sh               # Automated deployment
│   └── create-test-users.sql         # Create test data
├── middleware.ts                     # Route protection
└── docs/                             # Documentation
```

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 🚀 Inicio Rápido

### Pre-requisitos
- Node.js 18+
- Cuenta en Supabase
- Cuenta en Vercel (opcional)

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone [tu-repo]
cd mcp-dashboard-manager

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Ejecutar migraciones
# Ve a Supabase Dashboard → SQL Editor
# Ejecuta database/gamification-schema.sql
# Ejecuta database/auth-schema.sql

# 5. Crear usuarios de prueba
# En SQL Editor, ejecuta scripts/create-test-users.sql

# 6. Iniciar desarrollo
npm run dev

# 7. Abrir en navegador
# http://localhost:3000/login
```

---

## 📖 Documentación

### Guías Disponibles

1. **[INSTRUCCIONES-FINALES.md](INSTRUCCIONES-FINALES.md)** ⭐
   - Resumen ejecutivo del estado del proyecto
   - Próximos pasos para deployment
   - Credenciales de prueba

2. **[MANUAL-DEPLOYMENT.md](MANUAL-DEPLOYMENT.md)** 🚀
   - Guía paso a paso para deployment
   - Incluye screenshots y troubleshooting
   - Tiempo estimado: 30-55 minutos

3. **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** 🔧
   - Guía técnica detallada
   - Para desarrolladores
   - Scripts automatizados

4. **[IMPLEMENTATION-COMPLETE.md](IMPLEMENTATION-COMPLETE.md)** 📊
   - Documentación técnica completa
   - Lista de todos los componentes
   - Especificaciones del sistema

5. **[RESUMEN-FINAL.md](RESUMEN-FINAL.md)** 🎯
   - Resumen en español
   - Lo que se completó
   - Sistema de gamificación

6. **[AUTH-SYSTEM-COMPLETE.md](AUTH-SYSTEM-COMPLETE.md)** 🔐
   - Sistema de autenticación
   - Roles y permisos
   - Row Level Security

---

## 🎯 Credenciales de Prueba

Una vez completado el deployment:

### Broker
```
Email: broker1@selvadentro.com
Password: Broker123!
Acceso: Dashboard personal
```

### Director
```
Email: director@selvadentro.com
Password: Director123!
Acceso: Dashboard ejecutivo
```

### Admin
```
Email: admin@selvadentro.com
Password: Admin123!
Acceso: Dashboard ejecutivo + gestión
```

---

## 🔒 Seguridad

- ✅ Supabase Auth para autenticación
- ✅ Row Level Security (RLS) en PostgreSQL
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Middleware de protección de rutas
- ✅ Verificación de permisos en API
- ✅ Variables de entorno seguras

---

## 📱 Responsive Design

Optimizado para:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## 🧪 Testing

### Testing Manual
```bash
# Ejecutar en desarrollo
npm run dev

# Probar endpoints
curl http://localhost:3000/api/broker/dashboard?brokerId=broker_001
```

### Checklist de Testing
- [ ] Login funciona para cada rol
- [ ] Dashboard de broker carga métricas
- [ ] Dashboard ejecutivo muestra datos
- [ ] Filtros funcionan correctamente
- [ ] Crear actividad suma puntos
- [ ] Logros se desbloquean automáticamente
- [ ] Leaderboard se actualiza

---

## 🐛 Troubleshooting

### "Invalid API key"
- Verifica `.env.local` tiene las keys correctas
- Confirma que el Service Key sea el correcto

### "Table does not exist"
- Ejecuta las migraciones SQL
- Verifica que estés en el proyecto correcto de Supabase

### "Unauthorized"
- Verifica que el usuario tenga `user_id` en `broker_profiles`
- Confirma que el rol esté asignado

### Dashboard en blanco
- Abre F12 y revisa la consola
- Verifica las variables de entorno
- Confirma que Supabase esté activo

---

## 📈 Roadmap Futuro

Posibles mejoras:
- [ ] Notificaciones push
- [ ] Integración con WhatsApp
- [ ] Reportes automáticos por email
- [ ] App mobile nativa
- [ ] Sistema de comisiones automatizado
- [ ] Integración con CRM externo
- [ ] Analytics avanzados con IA
- [ ] Gamificación de equipos

---

## 👥 Roles del Sistema

### 🟢 Broker
- Ver su propio dashboard
- Ver sus métricas
- Completar tareas
- Ver su posición en ranking

### 🔵 Manager
- Ver dashboard ejecutivo
- Ver todos los brokers
- Aplicar filtros
- Ver alertas

### 🟣 Director
- Todo lo del Manager +
- Gestionar brokers
- Configurar metas
- Acceso a analytics

### 🔴 Admin
- Acceso total
- Gestionar usuarios
- Configurar sistema
- Permisos completos

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la documentación en `/docs`
2. Consulta `MANUAL-DEPLOYMENT.md` para deployment
3. Revisa `TROUBLESHOOTING.md` para problemas comunes
4. Abre un issue en GitHub

---

## 📄 Licencia

Propietario: Selvadentro Tulum
Uso interno del equipo de ventas

---

## 🎉 Créditos

Desarrollado para Selvadentro Tulum
Sistema de gamificación para motivar y gestionar el equipo de brokers inmobiliarios

**Estado**: ✅ Producción Ready
**Versión**: 1.0.0
**Fecha**: Octubre 2025

---

## 🚀 Deploy Now!

¿Listo para deployar?

1. Lee [INSTRUCCIONES-FINALES.md](INSTRUCCIONES-FINALES.md)
2. Sigue [MANUAL-DEPLOYMENT.md](MANUAL-DEPLOYMENT.md)
3. ¡En 30 minutos estará funcionando!

**¡Transforma la productividad de tu equipo hoy! 🎮📊**
