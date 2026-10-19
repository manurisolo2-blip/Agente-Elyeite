export type ProductCategory = 'sillones' | 'mesas' | 'sillas' | 'espacio';

export type StylePresetId = 'atelier' | 'botanical' | 'technical';

export interface StylePresetDefinition {
  id: StylePresetId;
  name: string;
  fontDisplay: string;
  fontSans: string;
  theme: {
    bgPrimary: string;
    bgSecondary: string;
    textPrimary: string;
    accentColor: string;
    hairlineColor: string;
  };
}

export const STYLE_PRESETS: Record<StylePresetId, StylePresetDefinition> = {
  atelier: {
    id: 'atelier',
    name: 'Atelier & Autor',
    fontDisplay: "'Instrument Serif', Georgia, serif",
    fontSans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    theme: {
      bgPrimary: '#F7F5F0',
      bgSecondary: '#EFECE6',
      textPrimary: '#181715',
      accentColor: '#8C5835',
      hairlineColor: '#DCD6CC',
    },
  },
  botanical: {
    id: 'botanical',
    name: 'Natural & Orgánico',
    fontDisplay: "'Fraunces', Georgia, serif",
    fontSans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    theme: {
      bgPrimary: '#F4F6F2',
      bgSecondary: '#E8ECE4',
      textPrimary: '#18241B',
      accentColor: '#4A5B45',
      hairlineColor: '#D3DCD0',
    },
  },
  technical: {
    id: 'technical',
    name: 'Arquitectura & Líneas',
    fontDisplay: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    theme: {
      bgPrimary: '#F2F4F7',
      bgSecondary: '#E4E7EC',
      textPrimary: '#0F172A',
      accentColor: '#8C5835',
      hairlineColor: '#CBD5E1',
    },
  },
};

export interface BrandTheme {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  accentColor: string;
  hairlineColor?: string;
}

export interface BrandProduct {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  features: string[];
  imageUrl: string;
  buyUrl: string;
}

export interface BrandConfig {
  brandName: string;
  tagline: string;
  logoUrl: string;
  stylePreset?: StylePresetId;
  theme: BrandTheme;
  shippingAndReturns: string;
  quickPrompts: string[];
  products: BrandProduct[];
}

export interface RecommendedProductOutput {
  id: string;
  matchReason: string;
  name: string;
  price: string;
  imageUrl: string;
  buyUrl: string;
}

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export function formatGeminiHistory(
  rawHistory?: ChatHistoryTurn[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  const sanitized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of rawHistory) {
    if (!turn || typeof turn !== 'object') continue;
    let text = '';
    if (typeof turn.text === 'string') {
      text = turn.text.trim();
    } else if (turn.text) {
      try {
        text = JSON.stringify(turn.text);
      } catch (_e) {
        text = '';
      }
    }
    if (!text) continue;

    const role: 'user' | 'model' = turn.role === 'model' ? 'model' : 'user';

    // Gemini API requires the first turn to have role 'user'
    if (sanitized.length === 0) {
      if (role === 'user') {
        sanitized.push({ role: 'user', parts: [{ text }] });
      }
      continue;
    }

    // Gemini API requires alternating roles
    const lastRole = sanitized[sanitized.length - 1].role;
    if (role !== lastRole) {
      sanitized.push({ role, parts: [{ text }] });
    }
  }

  // Because the upcoming request turn appended by the caller is ALWAYS 'user',
  // historyContents MUST end with 'model' (or be empty) so roles strictly alternate.
  while (sanitized.length > 0 && sanitized[sanitized.length - 1].role === 'user') {
    sanitized.pop();
  }

  return sanitized.slice(-8);
}

export interface AdvisorStructuredOutput {
  visualAnalysis: string | null;
  advisorMessage: string;
  recommendedProducts: RecommendedProductOutput[];
  closingQuestion: string;
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const BRAND_LOGO_SVG = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" fill="#181715"/>
    <text x="60" y="74" text-anchor="middle" fill="#F7F5F0" font-family="Instrument Serif, Georgia, serif" font-size="46" font-weight="600" letter-spacing="3">EY</text>
  </svg>
`);

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: 'EL YEITE · Taller de Muebles',
  tagline: 'Muebles de Diseño, Maderas Nobles y Tapicería a Medida',
  logoUrl: BRAND_LOGO_SVG,
  stylePreset: 'atelier',
  theme: {
    bgPrimary: '#F7F5F0',
    bgSecondary: '#EFECE6',
    textPrimary: '#181715',
    accentColor: '#8C5835',
    hairlineColor: '#DCD6CC',
  },
  shippingAndReturns:
    'Envíos a todo el país · Cuotas sin interés · Fabricación artesanal y géneros antimanchas',
  quickPrompts: [
    'Consultar por Sillón Sure',
    'Subir foto de mi living',
    'Medidas y telas antimanchas',
  ],
  products: [
    {
      id: 'EY-SURE',
      name: 'Sillón Sure',
      price: '$ 890.000 ARS',
      category: 'sillones',
      features: [
        'Estructura robusta en madera maciza estacionada con terminación artesanal',
        'Tapizado en género de alto tránsito con tratamiento antimanchas, fresco y fácil de limpiar',
        'Proporción ergonómica ideal para rincones de lectura o livings de 1.30 a 1.50 metros',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com/productos/sillon-sure',
    },
    {
      id: 'EY-SOFA-3C',
      name: 'Sofá de 3 Cuerpos Lino Antimanchas',
      price: '$ 1.650.000 ARS',
      category: 'sillones',
      features: [
        'Profundidad de 95 cm con placas soft de alta densidad y rebote ergonómico envolvente',
        'Fundas completamente desmontables y lavables en lino pesado con tratamiento antimanchas',
        'Ideal para livings familiares de alto tránsito y convivencia con niños o mascotas',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com',
    },
    {
      id: 'EY-MESA-COMEDOR',
      name: 'Mesa de Comedor Petiribí Macizo',
      price: '$ 1.290.000 ARS',
      category: 'mesas',
      features: [
        'Tapa de 200 × 100 cm en madera noble de Petiribí macizo seleccionado',
        'Lustre poliuretánico mate resistente a líquidos, calor y uso diario',
        'Capacidad cómoda para 8 comensales con estructura de ensamble artesanal espigado',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com',
    },
    {
      id: 'EY-MESA-RATONA',
      name: 'Mesa Ratona Bloque Petiribí',
      price: '$ 480.000 ARS',
      category: 'mesas',
      features: [
        'Madera maciza estacionada de 120 × 60 cm con ensamble ingletado continuo',
        'Altura ergonómica de 40 cm para acompañar livings y sofás principales',
        'Terminación al aceite y ceras naturales que realzan la veta viva de la madera',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com',
    },
    {
      id: 'EY-SILLA-PANA',
      name: 'Silla de Comedor Tapizada en Pana Antimanchas',
      price: '$ 290.000 ARS',
      category: 'sillas',
      features: [
        'Estructura reforzada en petiribí macizo con espigas y encastres dobles',
        'Asiento ergonómico con espuma alta densidad (28 kg) tapizado en pana antimanchas',
        'Fácil mantenimiento y suavidad al tacto en tono neutro combinable con comedores diarios',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1580481077111-e6307137f223?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com',
    },
    {
      id: 'EY-POLTRONA-BOUCLE',
      name: 'Poltrona Individual Bouclé Crudo',
      price: '$ 790.000 ARS',
      category: 'sillones',
      features: [
        'Diseño compacto de 78 cm de ancho, perfecto para dormitorio, estudio o rincón de lectura',
        'Tapizado envolvente en bouclé crudo texturado de alto tránsito',
        'Base con patas cónicas en madera noble a la vista con lustre natural mate',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com',
    },
  ],
};

export function buildAdvisorSystemInstruction(brandConfig: BrandConfig): string {
  const catalogJson = JSON.stringify(
    {
      brandName: brandConfig.brandName,
      tagline: brandConfig.tagline,
      shippingAndReturns: brandConfig.shippingAndReturns,
      products: brandConfig.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        features: p.features,
        imageUrl: p.imageUrl,
        buyUrl: p.buyUrl,
      })),
    },
    null,
    2
  );

  return `# ROL Y OBJETIVO
Actuás como el Asesor de Compras Multimodal Oficial de la mueblería artesanal ${brandConfig.brandName}. Tu único objetivo es atender consultas 24/7 en menos de 2 segundos, analizar fotos subidas por el cliente (de su living, comedor, rincón de lectura o espacio a equipar) y recomendarle con precisión quirúrgica el o los muebles exactos del catálogo oficial de El Yeite, llevándolo directo al link de compra.

# CATÁLOGO OFICIAL Y POLÍTICAS (BRAND_CONFIG)
\`\`\`json
${catalogJson}
\`\`\`

# REGLAS ESTRICTAS DE OPERACIÓN (CERO ALUCINACIÓN)
1. **Fidelidad Absoluta al Catálogo:** Usá EXCLUSIVAMENTE los muebles provistos en el bloque \`BRAND_CONFIG.products\` (Sillón Sure, Sofá de 3 Cuerpos, Mesa de Comedor Petiribí, Mesa Ratona Bloque, Silla de Comedor Tapizada, Poltrona Bouclé). Prohibido inventar productos, electrodomésticos, ropa o repuestos. Si preguntan por algo que no existe en el catálogo, ofrecé el mueble real más cercano disponible explicando honestamente la diferencia.
2. **Diagnóstico Visual Multimodal de Interiores:** Cuando el comprador adjunte una foto de su ambiente:
   - Identificá en 1 línea qué estás viendo en la foto (espacio disponible, iluminación, tipo de piso, distribución o rincón libre) y colocalo en \`visualAnalysis\`.
   - Si el comprador NO adjuntó ninguna imagen y solo envió texto, dejá \`visualAnalysis\` estrictamente en \`null\`.
   - Cruzá esos detalles visuales con las \`features\` y medidas de \`BRAND_CONFIG.products\`.
   - Seleccioná únicamente los **1 o 2 muebles** que mejor resuelvan su necesidad y explicá en máximo 2 líneas por qué encajan con su foto.
3. **Tono y Cierre Comercial:** Hablá en español rioplatense (voseo natural, cálido, ágil y directo, como un ebanista y diseñador de salón de muebles exclusivos). Cerrá siempre tu respuesta con una pregunta corta en \`closingQuestion\` que invite a concretar la compra o consultar por géneros antimanchas y medidas exactas.

# FORMATO DE SALIDA (JSON ESTRUCTURADO)
Respondé SIEMPRE devolviendo únicamente un objeto JSON válido con esta estructura exacta:
{
  "visualAnalysis": "Breve observación de lo detectado en la foto del usuario (dejar en null si solo envió texto).",
  "advisorMessage": "Tu respuesta persuasiva, directa y cálida de máximo 3 líneas.",
  "recommendedProducts": [
    {
      "id": "ID exacto del producto en BRAND_CONFIG",
      "matchReason": "1 línea de por qué este producto es ideal para su consulta o foto.",
      "name": "Nombre exacto del producto",
      "price": "Precio exacto",
      "imageUrl": "URL de imagen del producto",
      "buyUrl": "URL directa de compra"
    }
  ],
  "closingQuestion": "Pregunta corta de cierre comercial."
}`;
}

export function matchCatalogProducts(
  query: string,
  visualClues: string | undefined,
  brandConfig: BrandConfig
): { matched: BrandProduct[]; isExactCategoryMatch: boolean; detectedCategory: ProductCategory; isAntimanchasQuery: boolean } {
  const combined = `${query} ${visualClues || ''}`.toLowerCase();
  const foreignKeywords = [
    'heladera', 'televisor', 'tv', 'oled', 'smart tv', 'zapatilla', 'zapatillas', 'auto',
    'notebook', 'computadora', 'celular', 'iphone', 'ropa', 'remera', 'cafetera',
    'microondas', 'aire acondicionado', 'lavarropas'
  ];
  const isForeign = foreignKeywords.some((w) => combined.includes(w));

  const isAntimanchasQuery =
    combined.includes('antimancha') ||
    combined.includes('antimanchas') ||
    combined.includes('género') ||
    combined.includes('genero') ||
    combined.includes('tela') ||
    combined.includes('telas') ||
    combined.includes('limpiar') ||
    combined.includes('lavar');

  const categoryKeywords: Record<ProductCategory, string[]> = {
    sillones: [
      'sillón', 'sillon', 'sofá', 'sofa', 'poltrona', 'cuerpo', 'cuerpos', 'living', 'estar',
      'rincon', 'rincón', 'lectura', 'esquina', 'sure', 'boucle', 'bouclé', 'lino', 'relax', 'descanso',
    ],
    mesas: [
      'mesa', 'mesas', 'ratona', 'comedor', 'madera', 'petiribí', 'petiribi', 'comensales', 'tapa',
      'almuerzo', 'cena', 'bloque', 'centro',
    ],
    sillas: [
      'silla', 'sillas', 'pana', 'asiento', 'respaldo', 'comedor', 'tapizada', 'tapizadas',
    ],
    espacio: [
      'espacio', 'ambiente', 'casa', 'departamento', 'mueble', 'muebles', 'deco', 'decoración',
    ],
  };

  let bestCategory: ProductCategory = 'sillones';
  let maxCatScore = 0;

  for (const [cat, words] of Object.entries(categoryKeywords) as [ProductCategory, string[]][]) {
    let score = 0;
    for (const w of words) {
      if (combined.includes(w)) {
        score += 2;
      }
    }
    if (score > maxCatScore) {
      maxCatScore = score;
      bestCategory = cat;
    }
  }

  const scored = brandConfig.products.map((product) => {
    let score = product.category === bestCategory && maxCatScore > 0 ? 5 : 0;
    const searchable = `${product.id} ${product.name} ${product.category} ${product.features.join(' ')}`.toLowerCase();

    const tokens = combined
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 3);

    for (const token of tokens) {
      if (searchable.includes(token)) {
        score += 3;
      }
    }

    if (isAntimanchasQuery && searchable.includes('antimanchas')) {
      score += 6;
    }

    if ((combined.includes('sure') || combined.includes('1.30') || combined.includes('rincon') || combined.includes('rincón')) && product.id === 'EY-SURE') {
      score += 10;
    }
    if ((combined.includes('familiar') || combined.includes('chicos') || combined.includes('mascotas') || combined.includes('3 cuerpos')) && product.id === 'EY-SOFA-3C') {
      score += 10;
    }
    if ((combined.includes('comedor') || combined.includes('8 comensales') || combined.includes('200')) && product.id === 'EY-MESA-COMEDOR') {
      score += 10;
    }
    if ((combined.includes('ratona') || combined.includes('centro') || combined.includes('baja')) && product.id === 'EY-MESA-RATONA') {
      score += 10;
    }
    if ((combined.includes('silla') || combined.includes('sillas') || combined.includes('pana')) && product.id === 'EY-SILLA-PANA') {
      score += 10;
    }
    if ((combined.includes('boucle') || combined.includes('bouclé') || combined.includes('poltrona') || combined.includes('dormitorio') || combined.includes('estudio')) && product.id === 'EY-POLTRONA-BOUCLE') {
      score += 10;
    }

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, 2).map((s) => s.product);
  if (top.length > 0) {
    return {
      matched: top,
      isExactCategoryMatch: !isForeign,
      detectedCategory: top[0].category,
      isAntimanchasQuery,
    };
  }

  return {
    matched: [brandConfig.products[0], brandConfig.products[1] || brandConfig.products[0]],
    isExactCategoryMatch: !isForeign,
    detectedCategory: 'sillones',
    isAntimanchasQuery: false,
  };
}

export function sanitizeAdvisorResponse(
  rawInput: unknown,
  brandConfig: BrandConfig,
  options: { hasImage: boolean; userQuery: string; visualClues?: string }
): AdvisorStructuredOutput {
  const fallback = generateDeterministicAdvisorResponse(
    options.userQuery,
    brandConfig,
    options.hasImage,
    options.visualClues
  );

  if (!rawInput || typeof rawInput !== 'object') {
    return fallback;
  }

  const candidate = rawInput as Record<string, unknown>;

  let visualAnalysis: string | null = null;
  if (options.hasImage) {
    if (
      typeof candidate.visualAnalysis === 'string' &&
      candidate.visualAnalysis.trim().length > 0 &&
      candidate.visualAnalysis.trim().toLowerCase() !== 'null'
    ) {
      visualAnalysis = candidate.visualAnalysis.trim();
    } else {
      visualAnalysis = fallback.visualAnalysis;
    }
  } else {
    visualAnalysis = null;
  }

  const advisorMessage =
    typeof candidate.advisorMessage === 'string' && candidate.advisorMessage.trim().length > 0
      ? candidate.advisorMessage.trim()
      : fallback.advisorMessage;

  const rawRecs = Array.isArray(candidate.recommendedProducts) ? candidate.recommendedProducts : [];
  const validProducts: RecommendedProductOutput[] = [];
  const seenIds = new Set<string>();

  for (const item of rawRecs) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const rawId = typeof rec.id === 'string' ? rec.id.trim().toUpperCase() : '';
    const rawName = typeof rec.name === 'string' ? rec.name.trim().toLowerCase() : '';

    const catalogProduct =
      brandConfig.products.find((p) => p.id.toUpperCase() === rawId) ||
      brandConfig.products.find((p) => rawName.length > 3 && p.name.toLowerCase().includes(rawName));

    if (catalogProduct && !seenIds.has(catalogProduct.id)) {
      seenIds.add(catalogProduct.id);
      const matchReason =
        typeof rec.matchReason === 'string' && rec.matchReason.trim().length > 0
          ? rec.matchReason.trim()
          : fallback.recommendedProducts.find((fp) => fp.id === catalogProduct.id)?.matchReason ||
            catalogProduct.features[0] ||
            'Pieza artesanal seleccionada del catálogo oficial de El Yeite por compatibilidad exacta.';

      validProducts.push({
        id: catalogProduct.id,
        matchReason,
        name: catalogProduct.name,
        price: catalogProduct.price,
        imageUrl: catalogProduct.imageUrl,
        buyUrl: catalogProduct.buyUrl,
      });
    }

    if (validProducts.length >= 2) break;
  }

  if (validProducts.length === 0) {
    validProducts.push(...fallback.recommendedProducts.slice(0, 2));
  }

  const closingQuestion =
    typeof candidate.closingQuestion === 'string' && candidate.closingQuestion.trim().length > 0
      ? candidate.closingQuestion.trim()
      : fallback.closingQuestion;

  return {
    visualAnalysis,
    advisorMessage,
    recommendedProducts: validProducts,
    closingQuestion,
  };
}

export function generateDeterministicAdvisorResponse(
  query: string,
  brandConfig: BrandConfig,
  hasImage: boolean,
  visualClues?: string
): AdvisorStructuredOutput {
  const qLower = query.toLowerCase();
  const textAll = `${qLower} ${(visualClues || '').toLowerCase()}`;
  const cleanQuery = qLower.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();

  const getProduct = (id: string) =>
    brandConfig.products.find((p) => p.id === id) || brandConfig.products[0];

  // 1. Foreign / Non-catalog explicit check (only for products totally outside furniture)
  const foreignKeywords = [
    'heladera', 'televisor', 'tv', 'oled', 'smart tv', 'zapatilla', 'zapatillas', 'auto',
    'notebook', 'computadora', 'celular', 'iphone', 'ropa', 'remera', 'cafetera',
    'microondas', 'aire acondicionado', 'lavarropas'
  ];
  const isForeignProduct = foreignKeywords.some((w) => textAll.includes(w));

  // 2. Greeting / Open consultation
  const greetingWords = [
    'hola', 'buenas', 'buen dia', 'buen día', 'buenas tardes', 'buenas noches',
    'que tal', 'qué tal', 'hola buenas', 'hola buenas tardes', 'hola buen dia', 'hola!'
  ];
  const isGreetingWord =
    greetingWords.includes(cleanQuery) ||
    cleanQuery.startsWith('hola ') ||
    cleanQuery.startsWith('buenas ') ||
    cleanQuery === 'hola' ||
    cleanQuery === 'buenas';

  const isOpenConsultation =
    cleanQuery === 'info' ||
    cleanQuery === 'informacion' ||
    cleanQuery === 'información' ||
    cleanQuery.includes('tenes stock') ||
    cleanQuery.includes('tenés stock') ||
    cleanQuery.includes('que me recomendas') ||
    cleanQuery.includes('qué me recomendás') ||
    cleanQuery.includes('que tenes') ||
    cleanQuery.includes('qué tenés') ||
    cleanQuery.includes('que tienen') ||
    cleanQuery.includes('qué tienen') ||
    cleanQuery.includes('asesor') ||
    cleanQuery.includes('ayuda') ||
    cleanQuery.includes('consulta');

  // 3. Compact space / Rincón / Medidas compactas (1.20, 1.30, 1.40, rincón, lectura, chico, individual, dormitorio)
  const isEspacioChico =
    textAll.includes('1.20') ||
    textAll.includes('1.2') ||
    textAll.includes('1.30') ||
    textAll.includes('1.3') ||
    textAll.includes('1.40') ||
    textAll.includes('1.4') ||
    textAll.includes('1.50') ||
    textAll.includes('rincon') ||
    textAll.includes('rincón') ||
    textAll.includes('lectura') ||
    textAll.includes('chico') ||
    textAll.includes('chica') ||
    textAll.includes('pequeño') ||
    textAll.includes('pequeña') ||
    textAll.includes('compacto') ||
    textAll.includes('compacta') ||
    textAll.includes('individual') ||
    textAll.includes('dormitorio') ||
    textAll.includes('estudio') ||
    textAll.includes('sure') ||
    textAll.includes('medida') ||
    textAll.includes('medidas');

  // 4. Telas / Manchas / Mascotas / Chicos / Limpieza
  const isTelas =
    textAll.includes('mancha') ||
    textAll.includes('manchas') ||
    textAll.includes('manche') ||
    textAll.includes('manchen') ||
    textAll.includes('ensucie') ||
    textAll.includes('ensucien') ||
    textAll.includes('antimancha') ||
    textAll.includes('antimanchas') ||
    textAll.includes('limpiar') ||
    textAll.includes('limpieza') ||
    textAll.includes('perro') ||
    textAll.includes('perros') ||
    textAll.includes('gato') ||
    textAll.includes('gatos') ||
    textAll.includes('mascota') ||
    textAll.includes('mascotas') ||
    textAll.includes('chico') ||
    textAll.includes('chicos') ||
    textAll.includes('niño') ||
    textAll.includes('niños') ||
    textAll.includes('tela') ||
    textAll.includes('telas') ||
    textAll.includes('pana') ||
    textAll.includes('lino') ||
    textAll.includes('caluroso') ||
    textAll.includes('fresco') ||
    textAll.includes('lavar') ||
    textAll.includes('funda') ||
    textAll.includes('fundas') ||
    textAll.includes('desmontable') ||
    textAll.includes('desmontables') ||
    textAll.includes('tapizado') ||
    textAll.includes('tapizados') ||
    textAll.includes('genero') ||
    textAll.includes('género');

  // 5. Comedor / Mesas / Sillas
  const isMesaRatona =
    textAll.includes('ratona') ||
    textAll.includes('mesa baja') ||
    textAll.includes('mesa centro') ||
    textAll.includes('mesa de centro') ||
    textAll.includes('bloque') ||
    textAll.includes('120x60');

  const isComedor =
    textAll.includes('mesa') ||
    textAll.includes('mesas') ||
    textAll.includes('comedor') ||
    textAll.includes('silla') ||
    textAll.includes('sillas') ||
    textAll.includes('petiribi') ||
    textAll.includes('petiribí') ||
    textAll.includes('comensales');

  // 6. Envíos / Cuotas / Precios / Tiempos
  const isEnviosOCuotas =
    textAll.includes('envio') ||
    textAll.includes('envíos') ||
    textAll.includes('envios') ||
    textAll.includes('flete') ||
    textAll.includes('fletes') ||
    textAll.includes('entrega') ||
    textAll.includes('entregas') ||
    textAll.includes('demora') ||
    textAll.includes('tiempo') ||
    textAll.includes('tiempos') ||
    textAll.includes('cuota') ||
    textAll.includes('cuotas') ||
    textAll.includes('pago') ||
    textAll.includes('pagos') ||
    textAll.includes('tarjeta') ||
    textAll.includes('tarjetas') ||
    textAll.includes('precio') ||
    textAll.includes('precios') ||
    textAll.includes('costo') ||
    textAll.includes('interes') ||
    textAll.includes('interés') ||
    textAll.includes('financiacion') ||
    textAll.includes('financiación') ||
    textAll.includes('descuento') ||
    textAll.includes('transferencia');

  let selected: BrandProduct[] = [];
  let advisorMessage = '';
  let closingQuestion = '';

  if (isForeignProduct) {
    // Only trigger if asking for explicit non-furniture items
    selected = [getProduct('EY-SURE'), getProduct('EY-SOFA-3C')];
    advisorMessage = `Te soy 100% honesto: en ${brandConfig.brandName} nos especializamos exclusivamente en muebles de autor y tapicería a medida en maderas nobles. Te seleccioné las piezas oficiales más afines a tu búsqueda para que veas sus especificaciones.`;
    closingQuestion = '¿Buscás equipar algún ambiente en particular como living, comedor o rincón de lectura?';
  } else if ((isGreetingWord || isOpenConsultation || query.trim().length === 0) && !isEspacioChico && !isTelas && !isComedor && !isMesaRatona && !isEnviosOCuotas) {
    // 1. SALUDO O CONSULTA ABIERTA
    selected = [getProduct('EY-SURE'), getProduct('EY-SOFA-3C')];
    advisorMessage =
      '¡Hola! Qué bueno saludarte. Soy el asesor de EL YEITE · Taller de Muebles. Contame qué espacio estás armando (qué medidas tenés disponibles o si buscás tela antimanchas) o subí una foto de tu ambiente y te recomiendo el modelo ideal. Mirá, estas son dos de nuestras piezas más buscadas hoy:';
    closingQuestion = '¿Te gustaría contarnos sobre tu ambiente o preferís chequear medidas y telas de alguno de estos dos modelos?';
  } else if (isEspacioChico) {
    // 2. ESPACIO CHICO / RINCÓN / MEDIDAS COMPACTAS
    selected = [getProduct('EY-SURE'), getProduct('EY-POLTRONA-BOUCLE')];
    if (isTelas) {
      advisorMessage =
        'Para un espacio de 1.20m a 1.40m que requiera telas resistentes, te recomiendo el Sillón Sure y la Poltrona Individual Bouclé Crudo: por sus 78 cm de ancho entran perfecto sin recargar visualmente el paso, y vienen con géneros de alto tránsito con tratamiento antimanchas fresco y fácil de limpiar.';
      closingQuestion = '¿Querés chequear las medidas exactas de tu rincón para validar que entre con holgura o preferís ver opciones de tapizado?';
    } else {
      advisorMessage =
        'Para ese rincón o espacio compacto, te recomiendo el Sillón Sure y la Poltrona Individual Bouclé Crudo: por sus 78 cm de ancho entran perfecto en espacios de 1.20m a 1.40m sin recargar visualmente el paso, y vienen con tela antimanchas fresca y estructura en madera maciza.';
      closingQuestion = '¿Querés chequear las medidas exactas de tu rincón para validar que entre con holgura o preferís ver opciones de tapizado?';
    }
  } else if (isTelas) {
    // 3. TELAS / MANCHAS / MASCOTAS / CHICOS / LIMPIEZA
    selected = [getProduct('EY-SURE'), getProduct('EY-SOFA-3C')];
    advisorMessage =
      'Todos los tapizados de EL YEITE cuentan con proceso antimanchas repele-líquidos de fácil limpieza en seco. Para uso diario intensivo, chicos o mascotas, te recomiendo el Sillón Sure y el Sofá de 3 Cuerpos Lino Antimanchas, que además cuenta con fundas completamente desmontables y lavables en lavarropas.';
    closingQuestion = '¿Te gustaría que te enviemos el muestrario digital de géneros antimanchas y tonos disponibles?';
  } else if (isMesaRatona) {
    // 4. MESA RATONA
    selected = [getProduct('EY-MESA-RATONA'), getProduct('EY-SURE')];
    advisorMessage =
      'Nuestra Mesa Ratona Bloque en Petiribí Macizo de 120x60 cm tiene 40 cm de altura, la proporción justa para articular el centro de tu living junto a un sillón o sofá.';
    closingQuestion = '¿Te gustaría saber las terminaciones en aceite mate o ver opciones de entrega inmediata?';
  } else if (isComedor) {
    // 4. COMEDOR / MESAS / SILLAS
    selected = [getProduct('EY-MESA-COMEDOR'), getProduct('EY-SILLA-PANA')];
    advisorMessage =
      'Para armar tu comedor, te recomiendo la Mesa de Comedor Petiribí Macizo (200x100 cm para 8 comensales) junto a las Sillas Tapizadas en Pana Antimanchas, que combinan estructura reforzada en petiribí con tapizado de alta resistencia al uso diario.';
    closingQuestion = '¿Cuántos comensales solés recibir habitualmente para ajustar la medida o cantidad de sillas?';
  } else if (isEnviosOCuotas) {
    // 5. ENVÍOS / CUOTAS / PRECIOS / TIEMPOS
    selected = [getProduct('EY-SURE'), getProduct('EY-SOFA-3C')];
    advisorMessage =
      'En EL YEITE realizamos envíos asegurados a todo el país y contamos con hasta 6 cuotas sin interés con todas las tarjetas bancarias (o 15% de descuento por transferencia directa). Todos nuestros muebles son de fabricación artesanal en maderas nobles con garantía de taller.';
    closingQuestion = '¿A qué localidad necesitarías el envío o sobre qué modelo te gustaría consultar disponibilidad?';
  } else {
    // Fallback general de mobiliario
    selected = [getProduct('EY-SURE'), getProduct('EY-SOFA-3C')];
    advisorMessage =
      `Para equipar tu ambiente con calidez y diseño artesanal en ${brandConfig.brandName}, estas son dos de nuestras piezas principales fabricadas en maderas nobles y tapicería a medida:`;
    closingQuestion = '¿Buscás resolver un espacio en particular o te gustaría consultar por medidas especiales?';
  }

  let visualAnalysis: string | null = null;
  if (hasImage) {
    if (visualClues && visualClues.trim().length > 0) {
      visualAnalysis = visualClues.trim();
    } else if (isComedor || textAll.includes('comedor')) {
      visualAnalysis = 'Observo un área de comedor con buena luz que pide la calidez de la Mesa en Petiribí macizo de 200cm junto a sillas tapizadas.';
    } else if (isEspacioChico) {
      visualAnalysis = 'Veo en tu foto un ambiente con espacio libre de ~1.30m que pide la presencia del Sillón Sure o una Poltrona Bouclé.';
    } else if (textAll.includes('familiar') || textAll.includes('chicos') || textAll.includes('mascotas')) {
      visualAnalysis = 'Detecto un living familiar amplio de alto tránsito donde el Sofá de 3 Cuerpos con fundas lavables y género antimanchas resuelve confort y durabilidad.';
    } else {
      visualAnalysis = 'Veo en tu foto un ambiente con luz tenue y rincón disponible que pide la presencia de muebles en maderas nobles.';
    }
  }

  const recommendedProducts: RecommendedProductOutput[] = selected.map((prod) => ({
    id: prod.id,
    matchReason: prod.features[0] || `Mueble oficial de ${brandConfig.brandName} fabricado en maderas nobles con terminación artesanal.`,
    name: prod.name,
    price: prod.price,
    imageUrl: prod.imageUrl,
    buyUrl: prod.buyUrl,
  }));

  return {
    visualAnalysis,
    advisorMessage,
    recommendedProducts,
    closingQuestion,
  };
}
