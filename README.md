# IApdf - Procesador de PDFs con Inteligencia Artificial

Una aplicación de escritorio desarrollada con Electron que permite procesar documentos PDF utilizando inteligencia artificial a través de la API de OpenRouter y el modelo Gemini 2.5 Pro.

## 🚀 Características

- **Conversión de PDF a imágenes**: Convierte cada página del PDF en imágenes de alta calidad
- **Procesamiento con IA**: Utiliza Google Gemini 2.5 Pro a través de OpenRouter para analizar el contenido
- **Memoria conversacional**: Mantiene el contexto de páginas anteriores para análisis coherentes
- **Interfaz moderna**: UI intuitiva y responsiva con diseño moderno
- **Exportación de resultados**: Guarda las conversaciones en formato JSON
- **Configuración persistente**: Guarda automáticamente la configuración de API y prompts

## 🛠️ Tecnologías Utilizadas

- **Electron**: Framework para aplicaciones de escritorio
- **pdf2pic**: Conversión de PDF a imágenes
- **OpenRouter API**: Acceso a modelos de IA
- **Google Gemini 2.5 Pro**: Modelo de IA para análisis de documentos
- **HTML/CSS/JavaScript**: Frontend moderno y responsivo

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- API Key de OpenRouter (obtén una en [openrouter.ai](https://openrouter.ai))

## 🔧 Instalación

1. Clona o descarga este repositorio
2. Navega al directorio del proyecto:
   ```bash
   cd IApdf
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Construir para distribución
```bash
npm run build
```

## 📖 Guía de Uso

1. **Configuración inicial**:
   - Ingresa tu API Key de OpenRouter
   - Personaliza el prompt del sistema si lo deseas
   - Guarda la configuración

2. **Seleccionar PDF**:
   - Haz clic en "Seleccionar archivo PDF"
   - Elige el documento que deseas procesar

3. **Procesamiento**:
   - Escribe tu pregunta o instrucción en el campo correspondiente
   - Haz clic en "Procesar todas las páginas"
   - La aplicación procesará cada página manteniendo el contexto

4. **Resultados**:
   - Visualiza la conversación en tiempo real
   - Exporta los resultados en formato JSON
   - Limpia la conversación para comenzar una nueva

## 🔑 Configuración de API

Para usar esta aplicación necesitas una API Key de OpenRouter:

1. **Obtener API Key**:
   - Visita [OpenRouter Keys](https://openrouter.ai/keys)
   - Crea una cuenta si no tienes una
   - Genera una nueva API key
   - La clave debe comenzar con `sk-or-`

2. **Probar la API Key**:
   ```bash
   # Usar el script de prueba incluido
   node test-api.js sk-or-v1-tu-api-key-aqui
   ```

3. **Configurar en la aplicación**:
   - Pega la API key en el campo correspondiente
   - La aplicación validará automáticamente la clave
   - Guarda la configuración

> **Nota**: Mantén tu API key segura y nunca la compartas públicamente.

1. Visita [openrouter.ai](https://openrouter.ai)
2. Crea una cuenta o inicia sesión
3. Genera una API Key
4. Ingresa la API Key en la aplicación

## 🎯 Casos de Uso

- **Análisis de documentos**: Extrae información clave de documentos extensos
- **Resúmenes automáticos**: Genera resúmenes de cada página del documento
- **Extracción de datos**: Identifica y extrae datos específicos de formularios o tablas
- **Traducción**: Traduce el contenido del documento página por página
- **Análisis académico**: Analiza papers, tesis y documentos de investigación

## 🔒 Privacidad y Seguridad

- La API Key se almacena localmente en tu computadora
- Los archivos PDF se procesan localmente antes del envío
- Las imágenes temporales se eliminan automáticamente después del procesamiento
- No se almacenan datos en servidores externos salvo los necesarios para el procesamiento con IA

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔄 Actualizaciones

Para mantener la aplicación actualizada:

```bash
git pull origin main
npm install
npm start
```

## ⚡ Rendimiento

- Procesamiento optimizado de imágenes
- Gestión eficiente de memoria
- Limpieza automática de archivos temporales
- Progreso en tiempo real del procesamiento

---

**Desarrollado con ❤️ usando Electron y OpenRouter**
