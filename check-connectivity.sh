#!/bin/bash

echo "=== Diagnóstico de conectividad del Hospital Management ==="
echo ""

# Obtener IP local
echo "1. Tu IP local:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
echo ""

# Verificar si el backend está escuchando
echo "2. ¿El backend está escuchando en puerto 8080?"
if lsof -i :8080 > /dev/null 2>&1; then
  echo "✓ Sí, puerto 8080 está en escucha"
  echo "Procesos escuchando:"
  lsof -i :8080
else
  echo "✗ NO - El backend no está corriendo"
  echo "   Ejecuta: cd backend && mvn spring-boot:run"
fi
echo ""

# Verificar si el frontend está escuchando
echo "3. ¿El frontend está escuchando en puerto 5173?"
if lsof -i :5173 > /dev/null 2>&1; then
  echo "✓ Sí, puerto 5173 está en escucha"
else
  echo "✗ NO - El frontend no está corriendo"
  echo "   Ejecuta: cd frontend && npm run dev"
fi
echo ""

# Probar conexión a localhost:8080/api/qr/data/test
echo "4. Probando conexión a localhost:8080/api..."
if curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer dummy" > /dev/null 2>&1; then
  echo "✓ El backend responde en http://localhost:8080/api"
else
  echo "✗ El backend NO responde en http://localhost:8080/api"
fi
echo ""

echo "=== Instrucciones de acceso desde móvil ==="
echo ""
echo "Tu IP es: $(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}')"
echo "Abre en tu móvil: http://$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}'):5173"
echo ""
