import { GoogleGenAI, Type } from '@google/genai';
import {
  DEFAULT_BRAND_CONFIG,
  buildAdvisorSystemInstruction,
  sanitizeAdvisorResponse,
  generateDeterministicAdvisorResponse,
  formatGeminiHistory,
  cleanAssistantTurnText,
  cleanAndParseJson,
  extractJsonObject,
} from '../../src/utils/advisorEngine.ts';
import type { BrandConfig, ChatHistoryTurn } from '../../src/utils/advisorEngine.ts';

const OFFICIAL_MODEL = 'gemini-2.5-flash';

interface AdvisorRequestBody {
  apiKey?: string;
  message?: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageUrl?: string;
  visualClues?: string;
  history?: ChatHistoryTurn[];
  brandConfig?: BrandConfig;
}

const ADVISOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    visualAnalysis: {
      type: Type.STRING,
      nullable: true,
      description:
        'Breve observación en 1 línea de lo detectado en la foto del usuario (dejar en null si solo envió texto).',
    },
    advisorMessage: {
      type: Type.STRING,
      description: 'Respuesta persuasiva, directa y cálida en español rioplatense de máximo 3 líneas.',
    },
    recommendedProducts: {
      type: Type.ARRAY,
      description: 'Entre 1 y 2 productos exactos de BRAND_CONFIG.products.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'ID exacto del producto en BRAND_CONFIG',
          },
          matchReason: {
            type: Type.STRING,
            description: '1 línea de por qué este producto es ideal para su consulta o foto.',
          },
          name: {
            type: Type.STRING,
            description: 'Nombre exacto del producto',
          },
          price: {
            type: Type.STRING,
            description: 'Precio exacto',
          },
          imageUrl: {
            type: Type.STRING,
            description: 'URL de imagen del producto',
          },
          buyUrl: {
            type: Type.STRING,
            description: 'URL directa de compra',
          },
        },
        required: ['id', 'matchReason', 'name', 'price', 'imageUrl', 'buyUrl'],
      },
    },
    closingQuestion: {
      type: Type.STRING,
      description: 'Pregunta corta de cierre comercial invitando a concretar la compra o consultar medidas y telas.',
    },
  },
  required: ['visualAnalysis', 'advisorMessage', 'recommendedProducts', 'closingQuestion'],
};

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const startTime = Date.now();
  let body: AdvisorRequestBody = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch (_parseErr) {
    body = {};
  }

  const userMessage = (body.message || '').trim();
  const hasImage = Boolean(
    (body.imageBase64 && body.imageBase64.length > 0) ||
      (body.imageUrl && body.imageUrl.length > 0) ||
      (body.visualClues && body.visualClues.length > 0)
  );
  const activeBrandConfig: BrandConfig =
    body.brandConfig && Array.isArray(body.brandConfig.products) && body.brandConfig.products.length > 0
      ? body.brandConfig
      : DEFAULT_BRAND_CONFIG;

  const systemInstruction = buildAdvisorSystemInstruction(activeBrandConfig);

  const promptText =
    userMessage ||
    (hasImage
      ? 'Analizá esta foto y recomendame el o los muebles exactos de BRAND_CONFIG.products que mejor resuelvan mi espacio.'
      : 'Hola, necesito asesoramiento sobre el catálogo de muebles.');

  let resolvedBase64 = body.imageBase64 || '';
  let resolvedMimeType = body.imageMimeType || 'image/jpeg';

  if (resolvedBase64.includes(';base64,')) {
    const parts = resolvedBase64.split(';base64,');
    resolvedBase64 = parts[1];
    if (!body.imageMimeType && parts[0].startsWith('data:')) {
      resolvedMimeType = parts[0].replace('data:', '').trim();
    }
  }

  if (!resolvedBase64 && body.imageUrl) {
    try {
      const imgResponse = await fetch(body.imageUrl, {
        signal: AbortSignal.timeout(6000),
      });
      if (imgResponse.ok) {
        const contentType = imgResponse.headers.get('content-type');
        if (contentType) {
          resolvedMimeType = contentType.split(';')[0].trim();
        }
        const arrayBuf = await imgResponse.arrayBuffer();
        resolvedBase64 = Buffer.from(arrayBuf).toString('base64');
      }
    } catch (_fetchErr) {
      // Continue with text/visualClues if external image fetch fails
    }
  }

  const fullPromptText =
    hasImage && body.visualClues && !resolvedBase64
      ? `${promptText}\n[Contexto visual de la foto adjunta: ${body.visualClues}]`
      : promptText;

  const resolvedApiKey = (body.apiKey || '').trim() || (process.env.GEMINI_API_KEY || '').trim();
  const hasValidApiKey =
    Boolean(resolvedApiKey) && resolvedApiKey !== 'MY_GEMINI_API_KEY' && resolvedApiKey.length > 10;

  if (hasValidApiKey) {
    const ai = new GoogleGenAI({
      apiKey: resolvedApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const historyContents = formatGeminiHistory(body.history);

    const currentParts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (hasImage && resolvedBase64) {
      currentParts.push({
        inlineData: {
          mimeType: resolvedMimeType,
          data: resolvedBase64,
        },
      });
    }

    currentParts.push({ text: fullPromptText });

    const contents = [
      ...historyContents,
      {
        role: 'user',
        parts: currentParts,
      },
    ];

    const timeoutMs = hasImage ? 15000 : 12000;
    const candidateModels = [OFFICIAL_MODEL, 'gemini-3.8-flash'];

    for (const modelToTry of candidateModels) {
      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs)
        );
        const apiPromise = ai.models.generateContent({
          model: modelToTry,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: ADVISOR_RESPONSE_SCHEMA,
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          const parsed = extractJsonObject(response.text);
          if (parsed && typeof parsed === 'object') {
            const structured = sanitizeAdvisorResponse(parsed, activeBrandConfig, {
              hasImage,
              userQuery: promptText,
              visualClues: body.visualClues,
            });

            res.status(200).json({
              structured,
              meta: {
                source: 'gemini-live',
                modelUsed: modelToTry,
                latencyMs: Date.now() - startTime,
              },
            });
            return;
          }
        }
      } catch (err: any) {
        console.error(`Error en Gemini API (${modelToTry}):`, err?.message || err);
      }
    }
  }

  // Intento 2: Fallback de IA Real en Vivo (Pollinations OpenAI)
  try {
    const openAiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemInstruction },
    ];

    if (Array.isArray(body.history)) {
      for (const turn of body.history) {
        if (!turn || typeof turn !== 'object') continue;
        const role = turn.role === 'model' || turn.role === 'assistant' ? 'assistant' : 'user';
        let content = '';
        if (typeof turn.content === 'string') {
          content = turn.content;
        } else if (typeof turn.text === 'string') {
          content = turn.text;
        } else if (Array.isArray(turn.parts)) {
          content = turn.parts.map((p: any) => p?.text || '').join(' ').trim();
        }
        if (role === 'assistant') {
          content = cleanAssistantTurnText(content);
        }
        if (content.trim().length > 0) {
          openAiMessages.push({ role, content: content.trim() });
        }
      }
    }

    openAiMessages.push({ role: 'user', content: fullPromptText });

    const controller = new AbortController();
    const pollTimeout = setTimeout(() => controller.abort(), 25000);

    const pollSeed = Math.floor(Math.random() * 1000000);
    const pollRes = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://elyeite.com',
      },
      body: JSON.stringify({
        model: 'openai',
        seed: pollSeed,
        response_format: { type: 'json_object' },
        messages: openAiMessages,
      }),
      signal: controller.signal,
    });
    clearTimeout(pollTimeout);

    if (pollRes.ok) {
      const pollData = (await pollRes.json()) as any;
      const rawContent = pollData?.choices?.[0]?.message?.content;
      if (rawContent && typeof rawContent === 'string') {
        const parsedJson = extractJsonObject(rawContent);

        if (parsedJson && typeof parsedJson === 'object') {
          const structured = sanitizeAdvisorResponse(parsedJson, activeBrandConfig, {
            hasImage,
            userQuery: promptText,
            visualClues: body.visualClues,
          });

          res.status(200).json({
            structured,
            meta: {
              source: 'pollinations-live',
              modelUsed: 'openai',
              latencyMs: Date.now() - startTime,
            },
          });
          return;
        }
      }
    }
  } catch (pollErr: any) {
    console.error('Error en Pollinations Live IA:', pollErr?.message || pollErr);
  }

  const structured = generateDeterministicAdvisorResponse(
    userMessage,
    activeBrandConfig,
    hasImage,
    body.visualClues
  );

  res.status(200).json({
    structured,
    meta: {
      source: 'local-fallback',
      modelUsed: OFFICIAL_MODEL,
      latencyMs: Math.max(120, Date.now() - startTime),
      fallbackReason: 'all_live_ai_services_failed_or_timeout',
    },
  });
}
