import OpenAI from 'openai';

let deepseekInstance: OpenAI | null = null;

function getDeepseekClient(): OpenAI {
  if (!deepseekInstance) {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not set');
    }
    deepseekInstance = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    });
  }
  return deepseekInstance;
}

export const deepseek = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getDeepseekClient()[prop as keyof OpenAI];
  },
});

/**
 * Helper function para generar contenido con DeepSeek
 */
export async function generateContent(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const client = getDeepseekClient();
  
  const modelName = options?.model || 'deepseek-chat';
  
  try {
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from DeepSeek API');
    }
    return content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
}

