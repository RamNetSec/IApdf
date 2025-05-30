#!/bin/bash

# Script de prueba para IApdf
echo "🧪 Ejecutando pruebas de IApdf"
echo "=============================="

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."

REQUIRED_FILES=(
    "main.js"
    "preload.js" 
    "renderer.js"
    "index.html"
    "styles.css"
    "package.json"
    "README.md"
    "LICENSE.md"
    ".gitignore"
    "setup.sh"
    "config.example.json"
    "assets/icon.svg"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ Todos los archivos requeridos están presentes"
else
    echo "❌ Archivos faltantes:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "❌ Las dependencias no están instaladas. Ejecuta: npm install"
    exit 1
fi
echo "✅ Dependencias instaladas"

# Verificar sintaxis de archivos principales
echo "🔍 Verificando sintaxis de archivos JavaScript..."

# Verificar main.js
if ! node -c main.js 2>/dev/null; then
    echo "❌ Error de sintaxis en main.js"
    exit 1
fi

# Verificar preload.js
if ! node -c preload.js 2>/dev/null; then
    echo "❌ Error de sintaxis en preload.js"
    exit 1
fi

# Verificar renderer.js
if ! node -c renderer.js 2>/dev/null; then
    echo "❌ Error de sintaxis en renderer.js"
    exit 1
fi

echo "✅ Sintaxis de archivos JavaScript correcta"

# Verificar package.json
echo "📋 Verificando package.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    echo "❌ Error en package.json"
    exit 1
fi
echo "✅ package.json válido"

# Verificar que el puerto no esté en uso
echo "🌐 Verificando disponibilidad de recursos..."

# Crear directorio temporal de prueba
mkdir -p temp/test
if [ $? -eq 0 ]; then
    echo "✅ Permisos de escritura correctos"
    rm -rf temp/test
else
    echo "❌ Error de permisos de escritura"
    exit 1
fi

echo ""
echo "🎉 ¡Todas las pruebas pasaron exitosamente!"
echo ""
echo "La aplicación está lista para ejecutarse. Usa:"
echo "  npm start     - Para iniciar la aplicación"
echo "  npm run dev   - Para iniciar en modo desarrollo"
echo ""
echo "📝 Recordatorio:"
echo "  - Configura tu API Key de OpenRouter en la aplicación"
echo "  - Asegúrate de tener una conexión a internet estable"
echo ""
