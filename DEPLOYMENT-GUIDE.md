# 🚀 Guía de Deployment - Paso a Paso

## Estado Actual

✅ **Código completado** - Todos los componentes están listos
✅ **Supabase project creado** - Project ID: `mmxkcsqflbqzgsekxiwp`
⚠️ **Falta Service Key** - Necesaria para ejecutar migraciones

---

## Paso 1: Obtener Supabase Service Role Key 🔑

### Opción A - Desde el Dashboard (Recomendado):

1. Ve a: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api
2. En la sección **Project API keys**, busca `service_role` key
3. Click en "Reveal" o el ícono de ojo 👁️
4. Copia el valor completo (empieza con `eyJ...`)

### Opción B - Si no tienes acceso al dashboard:

El Service Role Key se usa para operaciones administrativas. Por seguridad, solo usuarios con rol de Owner/Admin pueden verlo.

### Una vez que tengas el Service Key:

Agrégalo al archivo `.env.local`:

```bash
# Edita el archivo .env.local y agrega:
SUPABASE_SERVICE_KEY=tu-service-key-aqui
```

---

## Paso 2: Ejecutar Migraciones de Base de Datos 📊

Una vez tengas el Service Key configurado, yo ejecutaré las migraciones automáticamente.

Las migraciones incluyen:
- ✅ Schema de gamificación (tablas, funciones, triggers)
- ✅ Schema de autenticación (roles, permisos, RLS)
- ✅ Vistas para optimización de queries
- ✅ Políticas de seguridad (Row Level Security)

**Archivos a ejecutar:**
1. `database/gamification-schema.sql` (primero)
2. `database/auth-schema.sql` (después)

---

## Paso 3: Crear Usuarios Iniciales 👥

### Usuarios recomendados para testing:

#### 1. Usuario Admin (Tú)
- **Email**: admin@selvadentro.com
- **Password**: (elige uno seguro)
- **Rol**: admin
- **Permisos**: Acceso total al sistema

#### 2. Usuario Director
- **Email**: director@selvadentro.com
- **Password**: (elige uno)
- **Rol**: director
- **Permisos**: Dashboard ejecutivo + gestión de brokers

#### 3. Usuario Manager
- **Email**: manager@selvadentro.com
- **Password**: (elige uno)
- **Rol**: manager
- **Permisos**: Dashboard ejecutivo + supervisión

#### 4. Broker de Prueba
- **Email**: broker1@selvadentro.com
- **Password**: (elige uno)
- **Rol**: broker
- **Permisos**: Solo su propio dashboard

---

## Paso 4: Deploy a Vercel 🌐

### Requisitos previos:
- Cuenta en Vercel (gratis): https://vercel.com
- Repo conectado a GitHub (ya lo tienes)

### Pasos:

1. **Instalar Vercel CLI** (opcional, pero recomendado):
```bash
npm i -g vercel
```

2. **Login a Vercel**:
```bash
vercel login
```

3. **Deploy desde la raíz del proyecto**:
```bash
vercel
```

4. **Configurar variables de entorno en Vercel**:

Ve a: `https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables`

Agrega estas variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://mmxkcsqflbqzgsekxiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_KEY=[tu-service-key]
GHL_PRIVATE_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
```

5. **Re-deploy con las variables**:
```bash
vercel --prod
```

---

## Paso 5: Testing Final 🧪

### Checklist de Testing:

#### Autenticación:
- [ ] Login como admin funciona
- [ ] Login como director funciona
- [ ] Login como manager funciona
- [ ] Login como broker funciona
- [ ] Redirección correcta según rol
- [ ] Logout funciona

#### Dashboard de Broker:
- [ ] Métricas se cargan correctamente
- [ ] Barra de progreso muestra nivel actual
- [ ] Tareas diarias se muestran
- [ ] Leaderboard se muestra
- [ ] Logros se cargan

#### Dashboard Ejecutivo:
- [ ] Filtros funcionan (fecha, broker, pipeline)
- [ ] Summary cards muestran datos
- [ ] Alertas se cargan
- [ ] Tabla de top performers funciona
- [ ] Gráficos renderizan correctamente
- [ ] Pipeline funnel se muestra

#### API Endpoints:
- [ ] `/api/broker/dashboard` responde
- [ ] `/api/broker/activities` (POST) crea actividades
- [ ] `/api/broker/activities` (GET) lista actividades
- [ ] `/api/leaderboard` muestra ranking
- [ ] `/api/executive/dashboard` con filtros funciona

#### Gamificación:
- [ ] Puntos se calculan correctamente
- [ ] Niveles se asignan bien
- [ ] Logros se desbloquean automáticamente
- [ ] Ranking se actualiza

---

## Paso 6: Datos de Prueba (Opcional) 🎲

Si quieres probar con datos reales, puedo crear un script para:
- Generar actividades de ejemplo
- Crear múltiples brokers de prueba
- Simular un mes de actividad
- Poblar el leaderboard

---

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Verifica que las keys en `.env.local` sean correctas
- Confirma que el Service Key esté revelado correctamente

### Error: "Table does not exist"
- Las migraciones no se ejecutaron
- Ejecuta los archivos SQL en orden (gamification → auth)

### Error: "Unauthorized"
- Verifica que el usuario tenga el rol correcto en `broker_profiles`
- Confirma que las políticas RLS estén activas

### Error: "Failed to fetch"
- Verifica que las URLs de API sean correctas
- Confirma que Supabase esté en funcionamiento

### Deploy falla en Vercel:
- Verifica que todas las variables de entorno estén configuradas
- Confirma que el build de Next.js pase localmente: `npm run build`

---

## 📞 Próximos Pasos AHORA

**Para continuar, necesito que:**

1. **Obtengas el Service Role Key** desde el dashboard de Supabase:
   - URL directa: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api
   - Busca la sección "Project API keys"
   - Copia el valor de `service_role`

2. **Me lo proporciones** (de forma segura):
   - Puedes pegarlo directamente aquí (esta conversación es privada)
   - O agregarlo manualmente al archivo `.env.local`
   - Después me confirmas que ya está agregado

3. **Una vez tengas el Service Key**, yo me encargaré de:
   - ✅ Ejecutar las migraciones automáticamente
   - ✅ Crear los usuarios de prueba
   - ✅ Configurar el deployment a Vercel
   - ✅ Ejecutar los tests

---

## 🎯 Resultado Final

Al terminar tendrás:
- ✅ Base de datos completamente configurada
- ✅ Usuarios de prueba funcionando
- ✅ App deployada en Vercel
- ✅ URL pública para acceder
- ✅ Sistema 100% funcional

**Tiempo estimado total**: 15-20 minutos

¿Listo para continuar? 🚀
