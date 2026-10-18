export type ProductCategory = 'espacio' | 'piel' | 'prenda' | 'repuesto';

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
    name: 'Botánica & Clínica',
    fontDisplay: "'Fraunces', Georgia, serif",
    fontSans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    theme: {
      bgPrimary: '#F4F6F2',
      bgSecondary: '#E8ECE4',
      textPrimary: '#18241B',
      accentColor: '#2D5A3F',
      hairlineColor: '#D3DCD0',
    },
  },
  technical: {
    id: 'technical',
    name: 'Técnico & Urbano',
    fontDisplay: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    theme: {
      bgPrimary: '#F2F4F7',
      bgSecondary: '#E4E7EC',
      textPrimary: '#0F172A',
      accentColor: '#D9381E',
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
      category: 'espacio',
      features: [
        'Estructura robusta en madera maciza estacionada con terminación artesanal',
        'Tapizado en género de alto tránsito con tratamiento antimanchas, fresco y fácil de limpiar',
        'Proporción ergonómica ideal para rincones de lectura o livings de 1.30 a 1.50 metros',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://elyeite.com/productos/sillon-sure',
    },
    {
      id: 'CR-02',
      name: 'Lámpara de Pie Arco Travertino 2700K',
      price: '$ 420.000 ARS',
      category: 'espacio',
      features: [
        'Base esculpida en piedra travertino natural y arco de bronce cepillado',
        'Globo difusor opal con LED cálido 2700K dimeable (1200 lúmenes)',
        'Altura 165 cm: ilumina esquinas oscuras sin necesidad de obra eléctrica en techo',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-02-lampara-arco-travertino',
    },
    {
      id: 'CR-03',
      name: 'Mesa Lateral Bloque Travertino & Roble',
      price: '$ 340.000 ARS',
      category: 'espacio',
      features: [
        'Tapa circular de piedra travertino apomazada de 45 cm de diámetro',
        'Base trípode en roble ahumado macizo (52 cm de altura)',
        'Ideal como mesa de apoyo junto a sillones bajos o camas',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-03-mesa-lateral-travertino',
    },
    {
      id: 'CR-04',
      name: 'Alfombra Telar Pura Lana Virgen Cruda 200×300',
      price: '$ 610.000 ARS',
      category: 'espacio',
      features: [
        'Tejida a mano en telar horizontal con 100% lana virgen patagónica sin teñir',
        'Medida 200 × 300 cm de alto tránsito y aislación acústica/térmica natural',
        'Unifica livings con piso de madera, porcelanato o cemento alisado',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-04-alfombra-telar-lana',
    },
    {
      id: 'CR-05',
      name: 'Difusor Ultrasónico Cerámica Gres & Cedro',
      price: '$ 115.000 ARS',
      category: 'espacio',
      features: [
        'Carcasa artesanal en cerámica gres horneada a 1240°C color piedra',
        'Incluye blend botánico de madera de cedro, bergamota y vetiver (30 ml)',
        'Excelente opción de regalo de diseño para casa o estudio (corte automático 8h)',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-05-difusor-ceramica-gres',
    },
    {
      id: 'CR-06',
      name: 'Sérum Botánico Hialurónico 2% + Niacinamida 5%',
      price: '$ 48.500 ARS',
      category: 'piel',
      features: [
        'Ácido hialurónico de doble peso molecular para hidratación profunda sin grasitud',
        'Niacinamida al 5% que calma rojeces, equilibra poros y devuelve luminosidad',
        'Frasco gotero ámbar 30 ml libre de fragancia, apto piel sensible o deshidratada',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-06-serum-hialuronico-niacinamida',
    },
    {
      id: 'CR-07',
      name: 'Emulsión Barrera Ceramidas III & Escualano Puro',
      price: '$ 54.000 ARS',
      category: 'piel',
      features: [
        'Complejo bio-idéntico de Ceramidas III y escualano vegetal de oliva (50 ml)',
        'Repara la barrera cutánea frente a tirantez, clima frío o descamación',
        'Textura sedosa no comedogénica para sellar la rutina de día y de noche',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-07-emulsion-barrera-ceramidas',
    },
    {
      id: 'CR-08',
      name: 'Contorno de Ojos Péptidos de Cobre & Cafeína',
      price: '$ 44.000 ARS',
      category: 'piel',
      features: [
        'Cafeína pura al 3% y péptidos descongestivos para bolsas y ojeras vasculares',
        'Aplicador metálico frío que desinflama la mirada en 60 segundos (15 ml)',
        'Ideal para signos de cansancio frente a pantallas o piel fina en párpados',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-08-contorno-ojos-peptidos',
    },
    {
      id: 'CR-09',
      name: 'Óleo Limpiador Botánico Jojoba & Camelia',
      price: '$ 41.000 ARS',
      category: 'piel',
      features: [
        'Emulsiona con agua tibia retirando protector solar y maquillaje sin irritar',
        'Prensado en frío de jojoba dorada y camelia japonesa (120 ml)',
        'Deja la piel elástica y limpia sin alterar el manto hidrolipídico',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-09-oleo-limpiador-jojoba',
    },
    {
      id: 'CR-10',
      name: 'Sobrecamisa Sastrera Lana Merino Patagónica',
      price: '$ 310.000 ARS',
      category: 'prenda',
      features: [
        '100% lana merino superfina (280 g/m²) en color Gris Grafito, no pica ni hace peeling',
        'Corte boxy sastrero relajado disponible en talles S, M, L y XL',
        'Funciona como tercera prenda urbana sobre remera blanca o camisa oxford',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-10-sobrecamisa-merino',
    },
    {
      id: 'CR-11',
      name: 'Pantalón Cargo Sastrero Gabardina Orgánica 10 oz',
      price: '$ 195.000 ARS',
      category: 'prenda',
      features: [
        'Gabardina esmerilada de algodón orgánico 10 oz en tono Arena Piedra',
        'Corte recto con pinzas sastreras y bolsillos laterales planos (talles 38 al 46)',
        'Calce cómodo y estructurado para uso diario en estudio o viaje',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-11-pantalon-cargo-gabardina',
    },
    {
      id: 'CR-12',
      name: 'Sweater Cuello Medio Cashmere & Merino Crudo',
      price: '$ 265.000 ARS',
      category: 'prenda',
      features: [
        'Hilado noble 70% lana merino superfina + 30% cashmere en punto inglés',
        'Talles S, M, L y XL con hombro caído arquitectónico y puños acanalados',
        'Regalo infalible de invierno y media estación con packaging de lienzo',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-12-sweater-cashmere-merino',
    },
    {
      id: 'CR-13',
      name: 'Tote Bag Cuero Vacuno Curtido Vegetal & Lona',
      price: '$ 230.000 ARS',
      category: 'prenda',
      features: [
        'Lona impermeable de 16 oz combinada con manijas y base en cuero vacuno suela',
        'Compartimento acolchado para notebook de hasta 16 pulgadas (42×35×14 cm)',
        'Excelente regalo unisex de uso diario o escapada de fin de semana',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-13-tote-bag-cuero-vegetal',
    },
    {
      id: 'CR-14',
      name: 'Kit Service Grupo E61: Junta Silicona 8.5mm + Ducha IMS',
      price: '$ 68.000 ARS',
      category: 'repuesto',
      features: [
        'Junta de silicona roja Ø 73×57×8.5mm grado alimenticio que no se cristaliza',
        'Membrana difusora IMS de acero inoxidable 200 µm para extracción pareja',
        'Elimina fugas laterales en cafeteras espresso grupo E61 de 58 mm',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-14-kit-service-e61-ims',
    },
    {
      id: 'CR-15',
      name: 'Portafiltro Naked 58mm Latón CNC & Mango Nogal',
      price: '$ 145.000 ARS',
      category: 'repuesto',
      features: [
        'Cabezal sin fondo mecanizado CNC en latón cromado con aletas de 6.2mm (E61)',
        'Incluye canasto de precisión de 18g y mango ergonómico en madera de nogal',
        'Permite diagnosticar canalización en vivo y obtener crema densa',
      ],
      imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=85',
      buyUrl: 'https://casario.ar/comprar/cr-15-portafiltro-naked-58mm',
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
Actuás como el Asesor de Compras Multimodal Oficial de la marca definida en \`BRAND_CONFIG\` (${brandConfig.brandName}). Tu único objetivo es atender consultas 24/7 en menos de 2 segundos, analizar fotos subidas por el cliente (de su espacio, su rostro/piel, una prenda o un repuesto) y recomendarle con precisión quirúrgica el o los artículos exactos del catálogo oficial, llevándolo directo al link de compra.

# CATÁLOGO OFICIAL Y POLÍTICAS (BRAND_CONFIG)
\`\`\`json
${catalogJson}
\`\`\`

# REGLAS ESTRICTAS DE OPERACIÓN (CERO ALUCINACIÓN)
1. **Fidelidad Absoluta al Catálogo:** Usá EXCLUSIVAMENTE los productos provistos en el bloque \`BRAND_CONFIG.products\`. Prohibido inventar productos, talles, medidas, precios, descuentos o URLs. Si preguntan por algo que no existe en el catálogo, ofrecé la alternativa más cercana disponible explicando honestamente la diferencia.
2. **Diagnóstico Visual Multimodal:** Cuando el comprador adjunte una imagen:
   - Identificá en 1 línea qué estás viendo en la foto (ej. iluminación y espacio disponible, tono/textura, estilo o pieza técnica) y colocalo en \`visualAnalysis\`.
   - Si el comprador NO adjuntó ninguna imagen y solo envió texto, dejá \`visualAnalysis\` estrictamente en \`null\`.
   - Cruzá esos detalles visuales con las \`features\` y especificaciones de \`BRAND_CONFIG.products\`.
   - Seleccioná únicamente los **1 o 2 productos** que mejor resuelvan su necesidad real y explicá en máximo 2 líneas por qué encajan con su foto.
3. **Tono y Cierre Comercial:** Hablá en español rioplatense (voseo natural, cálido, ágil y directo, como un vendedor experto de local exclusivo, sin frases robóticas ni introducciones largas). Cerrá siempre tu respuesta con una pregunta corta en \`closingQuestion\` que invite a concretar la compra o despejar la última duda.

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
): { matched: BrandProduct[]; isExactCategoryMatch: boolean; detectedCategory: ProductCategory; isGiftQuery: boolean } {
  const combined = `${query} ${visualClues || ''}`.toLowerCase();
  const isGiftQuery = combined.includes('regalo') || combined.includes('regalar') || combined.includes('obsequio');

  if (isGiftQuery) {
    const giftProducts = brandConfig.products.filter((p) =>
      p.features.some((f) => f.toLowerCase().includes('regalo')) || p.id === 'CR-05' || p.id === 'CR-12' || p.id === 'CR-13'
    );
    if (giftProducts.length > 0) {
      return {
        matched: giftProducts.slice(0, 2),
        isExactCategoryMatch: true,
        detectedCategory: giftProducts[0].category,
        isGiftQuery: true,
      };
    }
  }

  const categoryKeywords: Record<ProductCategory, string[]> = {
    espacio: [
      'living', 'rincón', 'rincon', 'esquina', 'sillón', 'sillon', 'lámpara', 'lampara',
      'luz', 'iluminación', 'iluminacion', 'espacio', 'madera', 'petiribí', 'petiribi',
      'travertino', 'lectura', 'ambiente', 'decoración', 'deco', 'mueble', 'mesa', 'alfombra', 'difusor',
      'sure', 'yeite', 'antimanchas', 'telas',
    ],
    piel: [
      'piel', 'rostro', 'cara', 'sérum', 'serum', 'hialurónico', 'hialuronico',
      'niacinamida', 'ceramidas', 'crema', 'emulsión', 'emulsion', 'tirante',
      'rojez', 'rojiza', 'deshidratada', 'seca', 'sensible', 'hidratación', 'ojos', 'ojeras', 'óleo', 'limpiador',
    ],
    prenda: [
      'prenda', 'ropa', 'camisa', 'sobrecamisa', 'campera', 'chaqueta', 'merino',
      'lana', 'pantalón', 'pantalon', 'cargo', 'gabardina', 'talle', 'modelo', 'look', 'outfit',
      'sastrero', 'sastrera', 'abrigo', 'vestir', 'sweater', 'cashmere', 'tote', 'bolso',
    ],
    repuesto: [
      'repuesto', 'cafetera', 'espresso', 'e61', 'junta', 'silicona', 'ducha', 'ims',
      'portafiltro', 'naked', '58mm', 'pierde agua', 'goteo', 'presión', 'presion',
      'café', 'cafe', 'grupo', 'canasto',
    ],
  };

  let bestCategory: ProductCategory = 'espacio';
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
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, 2).map((s) => s.product);
  if (top.length > 0) {
    return {
      matched: top,
      isExactCategoryMatch: maxCatScore > 0,
      detectedCategory: top[0].category,
      isGiftQuery: false,
    };
  }

  return {
    matched: brandConfig.products.slice(0, 2),
    isExactCategoryMatch: false,
    detectedCategory: 'espacio',
    isGiftQuery: false,
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
            'Seleccionado del catálogo oficial por compatibilidad exacta con tu consulta.';

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
  const { matched, isExactCategoryMatch, detectedCategory, isGiftQuery } = matchCatalogProducts(
    query,
    visualClues,
    brandConfig
  );

  const selected = matched.slice(0, 2);

  let visualAnalysis: string | null = null;
  if (hasImage) {
    if (visualClues && visualClues.trim().length > 0) {
      visualAnalysis = visualClues.trim();
    } else if (detectedCategory === 'espacio') {
      visualAnalysis =
        'Veo en tu foto un ambiente con luz tenue y rincón disponible de ~1.20m que pide la presencia del Sillón Sure en madera maciza e iluminación 2700K.';
    } else if (detectedCategory === 'piel') {
      visualAnalysis =
        'Identifico signos de deshidratación superficial y leve reactividad que responden bárbaro a Hialurónico 2% + Ceramidas III.';
    } else if (detectedCategory === 'prenda') {
      visualAnalysis =
        'Observo una base neutra urbana que cobra estructura al sumar una tercera prenda sastrera en lana merino patagónica.';
    } else {
      visualAnalysis =
        'Detecto un grupo espresso E61 de 58mm con desgaste en el sello de caucho que requiere junta de silicona 8.5mm y ducha IMS.';
    }
  }

  let advisorMessage: string;
  if (isGiftQuery) {
    advisorMessage = `Para quedar impecable con un regalo de autor, te separé las dos piezas más elegidas de ${brandConfig.brandName}: nuestro Difusor en Cerámica Gres con blend de cedro y el Sweater en Cashmere & Merino Crudo. Recorré con tranquilidad y contame para quién es.`;
  } else if (!isExactCategoryMatch && query.trim().length > 0) {
    advisorMessage = `Te soy 100% honesto: ese artículo específico no está en nuestro catálogo oficial de ${brandConfig.brandName}. Te seleccioné las alternativas reales más cercanas disponibles en stock para que veas sus especificaciones exactas.`;
  } else if (detectedCategory === 'espacio') {
    advisorMessage = `Para levantar ese espacio sin hacer obra, la dupla del Sillón Sure en madera maciza con la Lámpara Arco en piedra travertino 2700K te transforma el rincón al instante. Ambos están listos para envío.`;
  } else if (detectedCategory === 'piel') {
    advisorMessage = `Para devolverle confort y luz a tu piel desde hoy, te recomiendo combinar el Sérum de Hialurónico 2% + Niacinamida 5% con la Emulsión de Ceramidas III. Hidratan profundo y sellan la barrera sin dejar residuo pesado.`;
  } else if (detectedCategory === 'prenda') {
    advisorMessage = `En indumentaria trabajamos moldería sastrera relajada (talles S al XL arriba y 38 al 46 en pantalón). La Sobrecamisa de Lana Merino 280g y el Cargo en Gabardina 10 oz calzan impecable y te visten todo el año.`;
  } else {
    advisorMessage = `Para solucionar la pérdida de presión en tu cafetera E61, el Kit de Junta de Silicona de 8.5mm + Ducha IMS sella a 9 bares sin resecarse, y el Portafiltro Naked de 58mm te permite controlar la extracción en vivo.`;
  }

  const recommendedProducts: RecommendedProductOutput[] = selected.map((prod) => ({
    id: prod.id,
    matchReason: prod.features[0] || `Pieza oficial de ${brandConfig.brandName} con disponibilidad inmediata.`,
    name: prod.name,
    price: prod.price,
    imageUrl: prod.imageUrl,
    buyUrl: prod.buyUrl,
  }));

  const closingQuestion = isGiftQuery
    ? '¿Lo buscás con packaging de regalo listo para entregar hoy en CABA/GBA o envío al interior?'
    : '¿Lo buscás para envío inmediato hoy mismo o preferís chequear medidas y talles exactos?';

  return {
    visualAnalysis,
    advisorMessage,
    recommendedProducts,
    closingQuestion,
  };
}
