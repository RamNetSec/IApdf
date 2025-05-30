#!/usr/bin/env node

/**
 * Test script para verificar la conexión con OpenRouter API
 * Uso: node test-api.js YOUR_API_KEY
 */

const axios = require('axios');

async function testOpenRouterAPI(apiKey) {
  console.log('🔍 Verificando API key de OpenRouter...');
  console.log(`📋 API Key (primeros 20 caracteres): ${apiKey.substring(0, 20)}...`);
  
  // Verificar formato de API key
  if (!apiKey.startsWith('sk-or-')) {
    console.error('❌ Error: La API key debe comenzar con "sk-or-"');
    console.log('💡 Asegúrate de obtener tu API key desde: https://openrouter.ai/keys');
    return false;
  }

  try {
    console.log('🌐 Probando conexión con endpoint /models...');
    
    // Test 1: Listar modelos disponibles
    const modelsResponse = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://iapdf.local',
        'X-Title': 'IApdf-Test'
      },
      timeout: 10000
    });

    console.log('✅ Conexión exitosa con /models');
    console.log(`📊 Modelos disponibles: ${modelsResponse.data.data.length}`);
    
    // Verificar si Gemini 2.5 Pro está disponible
    const geminiModel = modelsResponse.data.data.find(model => 
      model.id === 'google/gemini-2.5-pro-exp-03-25' || model.id.includes('gemini-2.5-pro')
    );
    
    if (geminiModel) {
      console.log('✅ Modelo Gemini 2.5 Pro disponible:', geminiModel.id);
    } else {
      console.log('⚠️  Modelo Gemini 2.5 Pro no encontrado, usando modelo alternativo');
    }

    // Test 2: Hacer una solicitud simple de chat
    console.log('🤖 Probando solicitud de chat...');
    
    const chatResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: geminiModel ? geminiModel.id : 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Responde solo con "API funcionando correctamente"'
        }
      ],
      max_tokens: 20
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://iapdf.local',
        'X-Title': 'IApdf-Test'
      },
      timeout: 30000
    });

    console.log('✅ Solicitud de chat exitosa');
    console.log('🎯 Respuesta:', chatResponse.data.choices[0].message.content);
    
    return true;

  } catch (error) {
    console.error('❌ Error en la prueba de API:');
    
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📝 Status Text: ${error.response.statusText}`);
      console.error('📄 Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('💡 Solución: Verifica que tu API key sea correcta');
        console.log('🔗 Obtén tu API key en: https://openrouter.ai/keys');
      } else if (error.response.status === 404) {
        console.log('💡 Posible causa: El endpoint o modelo no existe');
      } else if (error.response.status === 429) {
        console.log('💡 Solución: Has excedido el límite de velocidad, espera un momento');
      }
    } else {
      console.error('📄 Error Message:', error.message);
    }
    
    return false;
  }
}

// Ejecutar test si se proporciona API key como argumento
if (process.argv.length < 3) {
  console.log('Uso: node test-api.js YOUR_OPENROUTER_API_KEY');
  console.log('Ejemplo: node test-api.js sk-or-v1-...');
  process.exit(1);
}

const apiKey = process.argv[2];
testOpenRouterAPI(apiKey).then(success => {
  if (success) {
    console.log('🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.');
  } else {
    console.log('💥 Las pruebas fallaron. Revisa tu API key y configuración.');
    process.exit(1);
  }
});
