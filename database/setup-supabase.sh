#!/bin/bash

# Script para configurar la base de datos en Supabase
# Este script crea todas las tablas y datos iniciales

PROJECT_REF="mmxkcsqflbqzgsekxiwp"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "🚀 Configurando base de datos en Supabase..."
echo "Project: $PROJECT_REF"
echo ""

# Verificar que tenemos las credenciales
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada"
    echo ""
    echo "Por favor ejecuta:"
    echo "export SUPABASE_SERVICE_ROLE_KEY='tu_service_role_key'"
    echo ""
    exit 1
fi

echo "✅ Credenciales encontradas"
echo ""

# Función para ejecutar SQL
execute_sql() {
    local sql_file=$1
    local description=$2

    echo "📝 Ejecutando: $description"

    curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": $(cat $sql_file | jq -Rs .)}"

    if [ $? -eq 0 ]; then
        echo "   ✅ Completado"
    else
        echo "   ❌ Error"
    fi
    echo ""
}

# Ejecutar el schema principal
echo "🔨 Creando schema de base de datos..."
execute_sql "mcp-manager-schema.sql" "Schema completo"

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Próximos pasos:"
echo "1. Ve a https://supabase.com/dashboard/project/${PROJECT_REF}/editor"
echo "2. Verifica que las tablas se crearon correctamente"
echo "3. Revisa los datos iniciales en las tablas"
echo ""
