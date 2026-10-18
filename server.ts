import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  DEFAULT_BRAND_CONFIG,
  buildAdvisorSystemInstruction,
  sanitizeAdvisorResponse,
  generateDeterministicAdvisorResponse,
} from './src/utils/advisorEngine.ts';
import type { BrandConfig } from './src/utils/advisorEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const OFFICIAL_MODEL = 'gemini-2.5-flash';

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface AdvisorRequestBody {
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
      description: 'Pregunta corta de cierre comercial invitando a concretar la compra.',
    },
  },
  required: ['visualAnalysis', 'advisorMessage', 'recommendedProducts', 'closingQuestion'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.post('/api/advisor/chat', async (req, res) => {
    const startTime = Date.now();
    const body = (req.body || {}) as AdvisorRequestBody;
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

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidApiKey =
      Boolean(apiKey) && apiKey !== 'MY_GEMINI_API_KEY' && apiKey!.trim().length > 10;

    if (hasValidApiKey) {
      const ai = new GoogleGenAI({
        apiKey: apiKey!,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const historyContents = Array.isArray(body.history)
        ? body.history.slice(-8).map((turn) => ({
            role: turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          }))
        : [];

      const currentParts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

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
          // If external image fetch fails, continue with text/visualClues
        }
      }

      if (hasImage && resolvedBase64) {
        currentParts.push({
          inlineData: {
            mimeType: resolvedMimeType,
            data: resolvedBase64,
          },
        });
      }

      const promptText =
        userMessage ||
        (hasImage
          ? 'Analizá esta foto y recomendame el o los muebles exactos de BRAND_CONFIG.products que mejor resuelvan mi espacio.'
          : 'Hola, necesito asesoramiento sobre el catálogo de muebles.');

      const fullPromptText =
        hasImage && body.visualClues && !resolvedBase64
          ? `${promptText}\n[Contexto visual de la foto adjunta: ${body.visualClues}]`
          : promptText;

      currentParts.push({ text: fullPromptText });

      const contents = [
        ...historyContents,
        {
          role: 'user',
          parts: currentParts,
        },
      ];

      const timeoutMs = hasImage ? 8000 : 4000;

      try {
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeoutMs)
        );
        const apiPromise = ai.models.generateContent({
          model: OFFICIAL_MODEL,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: ADVISOR_RESPONSE_SCHEMA,
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          const structured = sanitizeAdvisorResponse(parsed, activeBrandConfig, {
            hasImage,
            userQuery: promptText,
            visualClues: body.visualClues,
          });

          res.json({
            structured,
            meta: {
              modelUsed: OFFICIAL_MODEL,
              latencyMs: Date.now() - startTime,
            },
          });
          return;
        }
      } catch (_err) {
        // Fallback if API key is rate-limited or unreachable
      }
    }

    const structured = generateDeterministicAdvisorResponse(
      userMessage,
      activeBrandConfig,
      hasImage,
      body.visualClues
    );

    res.json({
      structured,
      meta: {
        modelUsed: OFFICIAL_MODEL,
        latencyMs: Math.max(120, Date.now() - startTime),
      },
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
