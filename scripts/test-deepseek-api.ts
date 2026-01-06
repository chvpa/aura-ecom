import OpenAI from 'openai';

async function testDeepseekAPI() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('❌ DEEPSEEK_API_KEY no está configurada en .env.local');
    console.log('\nPor favor, agrega tu API key al archivo .env.local:');
    console.log('DEEPSEEK_API_KEY=tu_api_key_aqui\n');
    console.log('Obtén tu API key en: https://platform.deepseek.com/api_keys\n');
    process.exit(1);
  }

  console.log('🔑 API Key encontrada');
  console.log(`📝 Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  try {
    console.log('🚀 Probando conexión con DeepSeek API...\n');

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Responde solo con: "API funcionando correctamente"',
        },
      ],
      max_tokens: 50,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error('No response content from DeepSeek API');
    }

    console.log('✅ API funcionando correctamente!');
    console.log(`📨 Respuesta: ${text}\n`);
    console.log('✅ La integración con DeepSeek está lista para usar.\n');
  } catch (error) {
    console.error('❌ Error al conectar con DeepSeek API:\n');
    
    if (error instanceof Error) {
      console.error(`Mensaje: ${error.message}`);
      
      if (error.message.includes('401') || error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid')) {
        console.error('\n⚠️  El problema parece ser de autenticación.');
        console.error('   Verifica que tu API key sea correcta.');
        console.error('   Obtén tu API key en: https://platform.deepseek.com/api_keys');
      } else if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
        console.error('\n⚠️  Has excedido el límite de cuota o rate limit.');
        console.error('   Espera unos minutos e intenta de nuevo.');
      } else {
        console.error('\n⚠️  Error desconocido. Verifica:');
        console.error('   1. Que tu API key sea válida');
        console.error('   2. Que tengas créditos disponibles en tu cuenta de DeepSeek');
        console.error('   3. Tu conexión a internet');
        console.error('   4. Obtén tu API key en: https://platform.deepseek.com/api_keys');
      }
    } else {
      console.error('Error desconocido:', error);
    }
    
    process.exit(1);
  }
}

testDeepseekAPI();

