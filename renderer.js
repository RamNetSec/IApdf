// Variables globales
let selectedPdfPath = null;
let imagesPaths = [];
let conversationHistory = [];
let currentConfig = {};

// Elementos del DOM
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const systemPromptTextarea = document.getElementById('systemPrompt');
const saveConfigBtn = document.getElementById('saveConfig');
const selectPdfBtn = document.getElementById('selectPdf');
const selectedFileDiv = document.getElementById('selectedFile');
const userPromptTextarea = document.getElementById('userPrompt');
const processPagesBtn = document.getElementById('processPages');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const conversationContainer = document.getElementById('conversationContainer');
const clearConversationBtn = document.getElementById('clearConversation');
const exportConversationBtn = document.getElementById('exportConversation');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfiguration();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Toggle para mostrar/ocultar API key
    toggleApiKeyBtn.addEventListener('click', () => {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
        toggleApiKeyBtn.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });

    // Guardar configuración
    saveConfigBtn.addEventListener('click', saveConfiguration);

    // Seleccionar PDF
    selectPdfBtn.addEventListener('click', selectPdfFile);

    // Procesar páginas
    processPagesBtn.addEventListener('click', processAllPages);

    // Limpiar conversación
    clearConversationBtn.addEventListener('click', clearConversation);

    // Exportar conversación
    exportConversationBtn.addEventListener('click', exportConversation);

    // Validación en tiempo real
    apiKeyInput.addEventListener('input', validateForm);
    userPromptTextarea.addEventListener('input', validateForm);
}

// Cargar configuración guardada
async function loadConfiguration() {
    try {
        const config = await window.electronAPI.loadConfig();
        if (config.apiKey) {
            apiKeyInput.value = config.apiKey;
        }
        if (config.systemPrompt) {
            systemPromptTextarea.value = config.systemPrompt;
        }
        currentConfig = config;
        validateForm();
    } catch (error) {
        console.error('Error loading configuration:', error);
        showNotification('Error al cargar la configuración', 'error');
    }
}

// Guardar configuración
async function saveConfiguration() {
    const config = {
        apiKey: apiKeyInput.value.trim(),
        systemPrompt: systemPromptTextarea.value.trim()
    };

    // Validar API Key antes de guardar
    if (config.apiKey) {
        // Verificar formato de API key
        if (!config.apiKey.startsWith('sk-or-')) {
            showNotification('API Key debe comenzar con "sk-or-". Verifica tu clave de OpenRouter.', 'error');
            return;
        }
        
        showNotification('Validando API Key...', 'info');
        const isValid = await window.electronAPI.validateApiKey(config.apiKey);
        if (!isValid) {
            showNotification('API Key inválida. Verifica tu clave en https://openrouter.ai/keys', 'error');
            return;
        }
    }

    try {
        const success = await window.electronAPI.saveConfig(config);
        if (success) {
            currentConfig = config;
            showNotification('Configuración guardada correctamente', 'success');
            validateForm();
        } else {
            showNotification('Error al guardar la configuración', 'error');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showNotification('Error al guardar la configuración', 'error');
    }
}

// Seleccionar archivo PDF
async function selectPdfFile() {
    try {
        const pdfPath = await window.electronAPI.selectPdf();
        if (pdfPath) {
            selectedPdfPath = pdfPath;
            const fileName = pdfPath.split('/').pop();
            selectedFileDiv.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <strong>Archivo seleccionado:</strong> ${fileName}
            `;
            selectedFileDiv.classList.add('show');
            validateForm();
        }
    } catch (error) {
        console.error('Error selecting PDF:', error);
        showNotification('Error al seleccionar el archivo PDF', 'error');
    }
}

// Validar formulario
function validateForm() {
    const hasApiKey = apiKeyInput.value.trim().length > 0;
    const hasPdf = selectedPdfPath !== null;
    const hasPrompt = userPromptTextarea.value.trim().length > 0;

    processPagesBtn.disabled = !(hasApiKey && hasPdf && hasPrompt);
}

// Verificar conexión a internet
async function checkConnection() {
    const isConnected = await window.electronAPI.checkInternetConnection();
    if (!isConnected) {
        showNotification('Sin conexión a internet. Verifica tu conexión.', 'warning');
        return false;
    }
    return true;
}

// Procesar todas las páginas
async function processAllPages() {
    if (!selectedPdfPath || !apiKeyInput.value.trim() || !userPromptTextarea.value.trim()) {
        showNotification('Por favor, complete todos los campos requeridos', 'error');
        return;
    }

    // Verificar conexión a internet
    const isConnected = await checkConnection();
    if (!isConnected) {
        return;
    }

    try {
        // Deshabilitar botón y mostrar progreso
        processPagesBtn.disabled = true;
        progressContainer.style.display = 'block';
        updateProgress('Convirtiendo PDF a imágenes...', 0);

        // Limpiar archivos temporales anteriores
        await window.electronAPI.cleanupTempFiles();

        // Convertir PDF a imágenes
        imagesPaths = await window.electronAPI.convertPdfToImages(selectedPdfPath);
        updateProgress('Imágenes generadas, iniciando procesamiento...', 10);

        // Preparar conversación
        conversationHistory = [{
            role: 'system',
            content: systemPromptTextarea.value.trim()
        }];

        const userPrompt = userPromptTextarea.value.trim();
        const apiKey = apiKeyInput.value.trim();

        // Procesar cada página
        for (let i = 0; i < imagesPaths.length; i++) {
            const pageNumber = i + 1;
            const imagePath = imagesPaths[i];
            
            updateProgress(`Procesando página ${pageNumber}/${imagesPaths.length}...`, 
                          10 + (i / imagesPaths.length) * 80);

            try {
                // Agregar contexto de página al prompt
                const pagePrompt = `[PÁGINA ${pageNumber}/${imagesPaths.length}]\n\n${userPrompt}`;
                
                // Procesar imagen con IA
                const response = await window.electronAPI.processImageWithAI(
                    imagePath, 
                    pagePrompt, 
                    apiKey, 
                    conversationHistory
                );

                // Agregar mensajes a la conversación
                conversationHistory.push({
                    role: 'user',
                    content: pagePrompt
                });

                conversationHistory.push({
                    role: 'assistant',
                    content: response
                });

                // Mostrar en la interfaz
                addMessageToConversation('user', pagePrompt, pageNumber);
                addMessageToConversation('assistant', response, pageNumber);

            } catch (error) {
                console.error(`Error processing page ${pageNumber}:`, error);
                const errorMessage = `Error al procesar la página ${pageNumber}: ${error.message}`;
                addMessageToConversation('assistant', errorMessage, pageNumber);
                conversationHistory.push({
                    role: 'assistant',
                    content: errorMessage
                });
            }
        }

        updateProgress('¡Procesamiento completado!', 100);
        showNotification('PDF procesado exitosamente', 'success');

        // Habilitar controles de conversación
        clearConversationBtn.disabled = false;
        exportConversationBtn.disabled = false;

    } catch (error) {
        console.error('Error processing PDF:', error);
        showNotification(`Error al procesar el PDF: ${error.message}`, 'error');
    } finally {
        // Re-habilitar botón y ocultar progreso
        processPagesBtn.disabled = false;
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);

        // Limpiar archivos temporales
        await window.electronAPI.cleanupTempFiles();
    }
}

// Actualizar barra de progreso
function updateProgress(text, percent) {
    progressText.textContent = text;
    progressPercent.textContent = `${Math.round(percent)}%`;
    progressFill.style.width = `${percent}%`;
}

// Agregar mensaje a la conversación
function addMessageToConversation(role, content, pageNumber = null) {
    // Remover empty state si existe
    const emptyState = conversationContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const icon = role === 'user' ? 'fas fa-user' : 'fas fa-robot';
    const roleText = role === 'user' ? 'Usuario' : 'Asistente IA';

    let pageIndicator = '';
    if (pageNumber && role === 'user') {
        pageIndicator = `<div class="page-indicator">Página ${pageNumber}</div>`;
    }

    messageDiv.innerHTML = `
        ${pageIndicator}
        <div class="message-header">
            <i class="${icon}"></i>
            ${roleText}
        </div>
        <div class="message-content">${formatMessageContent(content)}</div>
    `;

    conversationContainer.appendChild(messageDiv);
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

// Formatear contenido del mensaje
function formatMessageContent(content) {
    // Convertir saltos de línea y formato básico
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

// Limpiar conversación
function clearConversation() {
    conversationContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comment-slash"></i>
            <p>No hay conversación aún. Selecciona un PDF y comienza el procesamiento.</p>
        </div>
    `;
    conversationHistory = [];
    clearConversationBtn.disabled = true;
    exportConversationBtn.disabled = true;
}

// Exportar conversación
function exportConversation() {
    if (conversationHistory.length === 0) {
        showNotification('No hay conversación para exportar', 'error');
        return;
    }

    try {
        const exportData = {
            timestamp: new Date().toISOString(),
            pdfFile: selectedPdfPath ? selectedPdfPath.split('/').pop() : 'Unknown',
            conversation: conversationHistory.filter(msg => msg.role !== 'system'),
            summary: {
                totalPages: imagesPaths.length,
                totalMessages: conversationHistory.filter(msg => msg.role !== 'system').length,
                userPrompt: userPromptTextarea.value.trim(),
                systemPrompt: systemPromptTextarea.value.trim()
            }
        };

        // Crear y descargar archivo JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `iapdf-conversation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('Conversación exportada correctamente', 'success');
    } catch (error) {
        console.error('Error exporting conversation:', error);
        showNotification('Error al exportar la conversación', 'error');
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;

    // Colores según el tipo
    const colors = {
        success: '#48bb78',
        error: '#e53e3e',
        warning: '#ed8936',
        info: '#667eea'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Agregar estilos para las animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
