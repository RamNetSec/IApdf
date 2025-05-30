#!/bin/bash

# Script de inicialización para IApdf
echo "🚀 Iniciando IApdf - Procesador de PDFs con IA"
echo "============================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js versión 16 o superior."
    echo "   Visita: https://nodejs.org/"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versión $NODE_VERSION detectada. Se requiere versión 16 o superior."
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✅ npm $(npm --version) detectado"

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
    echo "✅ Dependencias instaladas correctamente"
else
    echo "✅ Dependencias ya instaladas"
fi

# Verificar archivos principales
REQUIRED_FILES=("main.js" "preload.js" "renderer.js" "index.html" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo requerido no encontrado: $file"
        exit 1
    fi
done

echo "✅ Todos los archivos principales encontrados"

# Crear directorios temporales si no existen
mkdir -p temp/images

echo ""
echo "🎉 IApdf está listo para usar!"
echo ""
echo "Comandos disponibles:"
echo "  npm start     - Iniciar la aplicación"
echo "  npm run dev   - Iniciar en modo desarrollo"
echo "  npm run build - Construir para distribución"
echo ""
echo "📋 Antes de usar:"
echo "  1. Obtén una API Key de OpenRouter: https://openrouter.ai"
echo "  2. Configura tu API Key en la aplicación"
echo "  3. ¡Comienza a procesar PDFs con IA!"
echo ""
