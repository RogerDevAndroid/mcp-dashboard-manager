#!/bin/bash

# Script para crear usuario administrador vía API
# Asegúrate de tener el servidor Next.js corriendo (npm run dev)

echo "🔐 Creando usuario administrador..."
echo ""

curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rgarciavital@gmail.com",
    "password": "holamundo",
    "nombre": "Roger Garcia Vital",
    "role": "admin"
  }' | json_pp

echo ""
echo "✅ Si el comando fue exitoso, ya puedes iniciar sesión con:"
echo "   Email: rgarciavital@gmail.com"
echo "   Password: holamundo"
