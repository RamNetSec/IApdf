#!/bin/bash

# Script para crear un PDF de prueba simple
echo "📄 Creando PDF de prueba para IApdf..."

# Crear contenido HTML simple
cat > /tmp/test_document.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documento de Prueba</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .highlight {
            background-color: #f39c12;
            padding: 2px 4px;
            color: white;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Documento de Prueba para IApdf</h1>
    
    <h2>Página 1: Introducción</h2>
    <p>Este es un <span class="highlight">documento de prueba</span> creado específicamente para probar la funcionalidad de IApdf.</p>
    
    <p>La aplicación IApdf puede procesar este documento y extraer información relevante usando inteligencia artificial.</p>
    
    <h2>Características del Documento</h2>
    <ul>
        <li>Contiene texto formateado</li>
        <li>Incluye tablas de datos</li>
        <li>Tiene múltiples secciones</li>
        <li>Diseñado para probar IA</li>
    </ul>
    
    <h2>Tabla de Ejemplo</h2>
    <table>
        <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Disponibilidad</th>
        </tr>
        <tr>
            <td>Laptop HP</td>
            <td>$850.00</td>
            <td>En stock</td>
        </tr>
        <tr>
            <td>Mouse Inalámbrico</td>
            <td>$25.99</td>
            <td>Limitado</td>
        </tr>
        <tr>
            <td>Teclado Mecánico</td>
            <td>$129.50</td>
            <td>Agotado</td>
        </tr>
    </table>
    
    <div style="page-break-before: always;"></div>
    
    <h2>Página 2: Datos Técnicos</h2>
    <p>Esta segunda página contiene información técnica adicional que la IA debería analizar en contexto con la página anterior.</p>
    
    <h3>Especificaciones Técnicas</h3>
    <ul>
        <li><strong>Procesador:</strong> Intel Core i7-12700H</li>
        <li><strong>Memoria RAM:</strong> 16GB DDR4</li>
        <li><strong>Almacenamiento:</strong> 512GB SSD NVMe</li>
        <li><strong>Pantalla:</strong> 15.6" Full HD IPS</li>
        <li><strong>Gráficos:</strong> NVIDIA RTX 3060</li>
    </ul>
    
    <h3>Información Importante</h3>
    <p>Los precios mostrados en la tabla anterior incluyen IVA y están sujetos a cambios sin previo aviso.</p>
    
    <p>Este documento demuestra cómo IApdf puede mantener el contexto entre páginas para proporcionar análisis coherentes.</p>
    
    <div style="margin-top: 50px; padding: 20px; border: 2px solid #e74c3c; background-color: #fdf2f2;">
        <h4 style="color: #e74c3c; margin-top: 0;">¡Nota Importante!</h4>
        <p style="margin-bottom: 0;">Este es un documento de prueba. Los datos son ficticios y se usan únicamente para demostrar las capacidades de procesamiento de IApdf.</p>
    </div>
</body>
</html>
EOF

# Intentar crear PDF usando wkhtmltopdf si está disponible
if command -v wkhtmltopdf &> /dev/null; then
    echo "✅ Usando wkhtmltopdf para crear PDF..."
    wkhtmltopdf /tmp/test_document.html "/home/ramnet/Documentos/PdfIntelligence/IApdf/test_document.pdf"
    echo "✅ PDF de prueba creado: test_document.pdf"
elif command -v pandoc &> /dev/null; then
    echo "✅ Usando pandoc para crear PDF..."
    pandoc /tmp/test_document.html -o "/home/ramnet/Documentos/PdfIntelligence/IApdf/test_document.pdf"
    echo "✅ PDF de prueba creado: test_document.pdf"
else
    echo "❌ No se encontró wkhtmltopdf ni pandoc para crear PDF"
    echo "💡 Instala uno de estos paquetes:"
    echo "   sudo apt-get install wkhtmltopdf"
    echo "   sudo apt-get install pandoc texlive-latex-base"
    echo ""
    echo "📄 Archivo HTML creado en: /tmp/test_document.html"
    echo "   Puedes convertirlo manualmente a PDF o usar cualquier PDF que tengas."
fi

# Limpiar archivo temporal
rm -f /tmp/test_document.html

echo "🎯 El PDF de prueba está listo para usar con IApdf!"
