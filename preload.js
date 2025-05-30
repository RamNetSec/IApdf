const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Selección de archivo PDF
  selectPdf: () => ipcRenderer.invoke('select-pdf'),
  
  // Conversión de PDF a imágenes
  convertPdfToImages: (pdfPath) => ipcRenderer.invoke('convert-pdf-to-images', pdfPath),
  
  // Procesamiento con IA
  processImageWithAI: (imagePath, prompt, apiKey, conversationHistory) => 
    ipcRenderer.invoke('process-image-with-ai', imagePath, prompt, apiKey, conversationHistory),
  
  // Limpieza de archivos temporales
  cleanupTempFiles: () => ipcRenderer.invoke('cleanup-temp-files'),
  
  // Configuración
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),

  // Verificación de conexión y API Key
  checkInternetConnection: () => ipcRenderer.invoke('check-internet-connection'),
  validateApiKey: (apiKey) => ipcRenderer.invoke('validate-api-key', apiKey),
});
