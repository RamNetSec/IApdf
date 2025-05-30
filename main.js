const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');

const execAsync = promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.svg'),
    title: 'IApdf - Procesador de PDFs con IA',
    show: false // No mostrar hasta que esté listo
  });

  mainWindow.loadFile('index.html');

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools en modo desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manejo de archivos PDF
ipcMain.handle('select-pdf', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Convertir PDF a imágenes usando pdftoppm
ipcMain.handle('convert-pdf-to-images', async (event, pdfPath) => {
  try {
    const outputDir = path.join(__dirname, 'temp', 'images');
    await fs.ensureDir(outputDir);

    // Limpiar directorio de salida
    await fs.emptyDir(outputDir);

    console.log('Convirtiendo PDF con pdftoppm:', pdfPath);

    // Verificar que pdftoppm esté disponible
    try {
      await execAsync('pdftoppm -h');
    } catch (error) {
      throw new Error('pdftoppm no está instalado. Instala poppler-utils: sudo apt install poppler-utils');
    }

    // Escapar caracteres especiales en la ruta del archivo
    const escapedPdfPath = pdfPath.replace(/'/g, "'\"'\"'");
    const outputPrefix = path.join(outputDir, 'page');

    // Convertir PDF a imágenes usando pdftoppm
    const command = `pdftoppm -jpeg -r 200 '${escapedPdfPath}' '${outputPrefix}'`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('Syntax Warning')) {
      console.warn('pdftoppm warning:', stderr);
    }

    // Obtener lista de imágenes generadas
    const files = await fs.readdir(outputDir);
    const imageFiles = files
      .filter(file => file.startsWith('page') && file.endsWith('.jpg'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      })
      .map(file => path.join(outputDir, file));

    if (imageFiles.length === 0) {
      throw new Error('No se generaron imágenes del PDF. Verifica que el archivo PDF sea válido.');
    }

    console.log(`PDF convertido exitosamente: ${imageFiles.length} páginas`);
    return imageFiles;

  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error(`Error al convertir PDF: ${error.message}`);
  }
});

// Procesar imagen con OpenRouter
ipcMain.handle('process-image-with-ai', async (event, imagePath, prompt, apiKey, conversationHistory) => {
  try {
    console.log('Processing image with AI...', { imagePath, apiKey: apiKey.substring(0, 20) + '...' });
    
    // Validar que la API key tenga el formato correcto
    if (!apiKey || !apiKey.startsWith('sk-or-')) {
      throw new Error('API key debe comenzar con "sk-or-" para OpenRouter');
    }

    // Leer imagen y convertir a base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Preparar mensajes de conversación
    const messages = [
      {
        role: 'system',
        content: 'Eres un asistente especializado en analizar documentos PDF. Mantienes el contexto de las páginas anteriores para proporcionar análisis coherentes y completos.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ];

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.5-pro-preview',
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://iapdf.local',
        'X-Title': 'IApdf'
      },
      timeout: 30000
    });

    console.log('AI response received successfully');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing image with AI:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('API key inválida. Verifica tu clave de OpenRouter.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint no encontrado. Verifica que el modelo esté disponible.');
    } else if (error.response?.status === 429) {
      throw new Error('Límite de velocidad excedido. Intenta nuevamente en unos momentos.');
    } else {
      throw new Error(`Error de API: ${error.response?.data?.error?.message || error.message}`);
    }
  }
});

// Limpiar archivos temporales
ipcMain.handle('cleanup-temp-files', async () => {
  try {
    const tempDir = path.join(__dirname, 'temp');
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  } catch (error) {
    console.error('Error cleaning temp files:', error);
  }
});

// Guardar configuración
ipcMain.handle('save-config', async (event, config) => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    await fs.writeJSON(configPath, config, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
});

// Cargar configuración
ipcMain.handle('load-config', async () => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (await fs.pathExists(configPath)) {
      return await fs.readJSON(configPath);
    }
    return {};
  } catch (error) {
    console.error('Error loading config:', error);
    return {};
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Verificar conexión a internet
ipcMain.handle('check-internet-connection', async () => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      timeout: 5000,
      headers: {
        'User-Agent': 'IApdf/1.0.0'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
});

// Validar API Key
ipcMain.handle('validate-api-key', async (event, apiKey) => {
  try {
    // Primero intentamos con un endpoint simple para validar la clave
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://iapdf.local',
        'X-Title': 'IApdf'
      },
      timeout: 10000
    });
    return response.status === 200;
  } catch (error) {
    console.error('API Key validation error:', error.response?.status, error.response?.data);
    return false;
  }
});
