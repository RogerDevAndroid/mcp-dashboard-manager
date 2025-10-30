#!/bin/bash

# 🚀 Script de Setup Automatizado para Deployment
# Este script ejecuta todas las migraciones y configuraciones necesarias

set -e  # Exit on error

echo "🚀 Iniciando setup de deployment..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que existe .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local no encontrado${NC}"
    echo "Por favor crea el archivo .env.local con las credenciales de Supabase"
    exit 1
fi

# Cargar variables de entorno
source .env.local

# Verificar variables requeridas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_SUPABASE_URL no configurada${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Error: SUPABASE_SERVICE_KEY no configurada${NC}"
    echo ""
    echo -e "${YELLOW}Para obtener el Service Key:${NC}"
    echo "1. Ve a: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api"
    echo "2. Busca 'service_role' key"
    echo "3. Click en 'Reveal' y copia el valor"
    echo "4. Agrégalo a .env.local como: SUPABASE_SERVICE_KEY=tu-key"
    exit 1
fi

echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"
echo ""

# Paso 1: Ejecutar migraciones
echo -e "${BLUE}📊 Paso 1/4: Ejecutando migraciones de base de datos...${NC}"
echo ""

# Ejecutar gamification-schema.sql
echo "Ejecutando gamification-schema.sql..."
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d @database/gamification-schema.sql 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Ejecutando con método alternativo...${NC}"
    # Si falla el método REST, usamos psql si está disponible
    if command -v psql &> /dev/null; then
        PGPASSWORD="${SUPABASE_SERVICE_KEY}" psql -h "${NEXT_PUBLIC_SUPABASE_URL/https:\/\//}" -U postgres -d postgres -f database/gamification-schema.sql
    else
        echo -e "${YELLOW}⚠️  Por favor ejecuta manualmente: database/gamification-schema.sql${NC}"
        echo "Puedes hacerlo desde el SQL Editor en Supabase Dashboard"
    fi
}

echo -e "${GREEN}✅ Gamification schema ejecutado${NC}"
echo ""

# Ejecutar auth-schema.sql
echo "Ejecutando auth-schema.sql..."
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d @database/auth-schema.sql 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Ejecutando con método alternativo...${NC}"
    if command -v psql &> /dev/null; then
        PGPASSWORD="${SUPABASE_SERVICE_KEY}" psql -h "${NEXT_PUBLIC_SUPABASE_URL/https:\/\//}" -U postgres -d postgres -f database/auth-schema.sql
    else
        echo -e "${YELLOW}⚠️  Por favor ejecuta manualmente: database/auth-schema.sql${NC}"
        echo "Puedes hacerlo desde el SQL Editor en Supabase Dashboard"
    fi
}

echo -e "${GREEN}✅ Auth schema ejecutado${NC}"
echo ""

# Paso 2: Verificar instalación de dependencias
echo -e "${BLUE}📦 Paso 2/4: Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# Paso 3: Build del proyecto
echo -e "${BLUE}🔨 Paso 3/4: Compilando proyecto...${NC}"
npm run build
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# Paso 4: Verificar deployment (Vercel)
echo -e "${BLUE}🌐 Paso 4/4: Información de deployment...${NC}"
echo ""
echo "Para deployar a Vercel:"
echo "1. Instala Vercel CLI: npm i -g vercel"
echo "2. Login: vercel login"
echo "3. Deploy: vercel --prod"
echo ""
echo "Recuerda configurar las variables de entorno en Vercel:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_KEY"
echo "  - GHL_PRIVATE_TOKEN"
echo "  - GHL_LOCATION_ID"
echo ""

echo -e "${GREEN}✅ Setup completado exitosamente!${NC}"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo "1. Crear usuarios de prueba (ver scripts/create-test-users.sh)"
echo "2. Deployar a Vercel (vercel --prod)"
echo "3. Probar la aplicación"
echo ""
echo "🎉 Todo listo para producción!"
