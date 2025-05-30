const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { pdf2pic } = require('pdf2pic');
const axios = require('axios');

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

// Convertir PDF a imágenes
ipcMain.handle('convert-pdf-to-images', async (event, pdfPath) => {
  try {
    const outputDir = path.join(__dirname, 'temp', 'images');
    await fs.ensureDir(outputDir);

    // Configurar pdf2pic
    const convertConfig = {
      density: 200,           // Alta calidad
      saveFilename: "page",
      savePath: outputDir,
      format: "jpeg",
      width: 1200,
      height: 1600
    };

    const convert = pdf2pic.fromPath(pdfPath, convertConfig);
    const results = await convert.bulk(-1); // Convertir todas las páginas

    // Ordenar los archivos por número de página
    const imageFiles = results
      .map(result => result.path)
      .sort((a, b) => {
        const numA = parseInt(path.basename(a).match(/\d+/)[0]);
        const numB = parseInt(path.basename(b).match(/\d+/)[0]);
        return numA - numB;
      });

    return imageFiles;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
});

// Procesar imagen con OpenRouter
ipcMain.handle('process-image-with-ai', async (event, imagePath, prompt, apiKey, conversationHistory) => {
  try {
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
      model: 'google/gemini-2.5-pro-exp-03-25',
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/yourusername/iapdf',
        'X-Title': 'IApdf'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error processing image with AI:', error);
    throw error;
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
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
});
