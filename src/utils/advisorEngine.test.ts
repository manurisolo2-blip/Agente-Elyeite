import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BRAND_CONFIG,
  STYLE_PRESETS,
  buildAdvisorSystemInstruction,
  matchCatalogProducts,
  sanitizeAdvisorResponse,
  generateDeterministicAdvisorResponse,
} from './advisorEngine.ts';

test('BRAND_CONFIG contains exactly 6 furniture products with real photography URLs, theme, quickPrompts, and shippingAndReturns', () => {
  assert.equal(DEFAULT_BRAND_CONFIG.products.length, 6);
  assert.equal(DEFAULT_BRAND_CONFIG.quickPrompts.length, 3);
  assert.equal(DEFAULT_BRAND_CONFIG.stylePreset, 'atelier');
  assert.ok(DEFAULT_BRAND_CONFIG.theme.bgPrimary);
  assert.ok(DEFAULT_BRAND_CONFIG.theme.accentColor);
  assert.ok(DEFAULT_BRAND_CONFIG.theme.hairlineColor);
  assert.ok(DEFAULT_BRAND_CONFIG.shippingAndReturns.length > 10);
  for (const product of DEFAULT_BRAND_CONFIG.products) {
    assert.ok(
      product.imageUrl.startsWith('https://images.unsplash.com/photo-'),
      `Expected real photo URL for ${product.id}, got ${product.imageUrl}`
    );
    assert.ok(product.name.length > 3);
    assert.ok(product.price.includes('ARS'));
  }
});

test('STYLE_PRESETS defines curated typography pairs and color palettes for atelier, botanical, and technical', () => {
  assert.ok(STYLE_PRESETS.atelier);
  assert.ok(STYLE_PRESETS.botanical);
  assert.ok(STYLE_PRESETS.technical);

  assert.ok(STYLE_PRESETS.atelier.fontDisplay.includes('Instrument Serif'));
  assert.ok(STYLE_PRESETS.atelier.fontSans.includes('Plus Jakarta Sans'));

  assert.ok(STYLE_PRESETS.botanical.fontDisplay.includes('Fraunces'));
  assert.ok(STYLE_PRESETS.botanical.fontSans.includes('DM Sans'));

  assert.ok(STYLE_PRESETS.technical.fontDisplay.includes('Space Grotesk'));
  assert.ok(STYLE_PRESETS.technical.fontSans.includes('IBM Plex Sans'));
});

test('System instruction contains El Yeite products and strict rules', () => {
  const instruction = buildAdvisorSystemInstruction(DEFAULT_BRAND_CONFIG);
  assert.ok(instruction.includes('EY-SURE'));
  assert.ok(instruction.includes('EY-SOFA-3C'));
  assert.ok(instruction.includes('EY-MESA-COMEDOR'));
  assert.ok(instruction.includes('CERO ALUCINACIÓN'));
  assert.ok(instruction.includes('visualAnalysis'));
});

test('sanitizeAdvisorResponse sets visualAnalysis to null when hasImage is false and enforces catalog values', () => {
  const raw = {
    visualAnalysis: 'Invented image observation when user sent no photo',
    advisorMessage: 'Acá tenés el sillón ideal para tu living.',
    recommendedProducts: [
      {
        id: 'EY-SURE',
        matchReason: 'Medida compacta.',
        name: 'Nombre Inventado',
        price: '$ 10 ARS',
        imageUrl: 'https://fake.url/img.jpg',
        buyUrl: 'https://fake.url/buy',
      },
    ],
    closingQuestion: '¿Te lo separamos para envío hoy?',
  };

  const result = sanitizeAdvisorResponse(raw, DEFAULT_BRAND_CONFIG, {
    hasImage: false,
    userQuery: 'Busco un sillón para el living',
  });

  assert.equal(result.visualAnalysis, null);
  assert.equal(result.recommendedProducts.length, 1);
  const catalogItem = DEFAULT_BRAND_CONFIG.products.find((p) => p.id === 'EY-SURE')!;
  assert.equal(result.recommendedProducts[0].name, catalogItem.name);
  assert.equal(result.recommendedProducts[0].price, catalogItem.price);
  assert.equal(result.recommendedProducts[0].buyUrl, catalogItem.buyUrl);
});

test('matchCatalogProducts routes furniture queries accurately (antimanchas, comedor, rincon, sofa)', () => {
  const antimanchasMatch = matchCatalogProducts('Buscamos telas antimanchas para chicos', undefined, DEFAULT_BRAND_CONFIG);
  assert.equal(antimanchasMatch.isAntimanchasQuery, true);
  assert.ok(antimanchasMatch.matched.length >= 1);

  const comedorMatch = matchCatalogProducts(
    'Mesa de comedor para 8 comensales en madera maciza',
    undefined,
    DEFAULT_BRAND_CONFIG
  );
  assert.equal(comedorMatch.detectedCategory, 'mesas');
  assert.ok(comedorMatch.matched.some((p) => p.id === 'EY-MESA-COMEDOR'));

  const rinconMatch = matchCatalogProducts(
    'Rincón libre de 1.30m para sillón de lectura',
    undefined,
    DEFAULT_BRAND_CONFIG
  );
  assert.ok(rinconMatch.matched.some((p) => p.id === 'EY-SURE'));
});

test('generateDeterministicAdvisorResponse explains honestly when product is not in catalog', () => {
  const outOfCatalog = generateDeterministicAdvisorResponse(
    'Hola, tenés televisor OLED de 85 pulgadas o heladera inverter?',
    DEFAULT_BRAND_CONFIG,
    false
  );
  assert.equal(outOfCatalog.visualAnalysis, null);
  assert.ok(outOfCatalog.advisorMessage.includes('nos especializamos exclusivamente en muebles'));
  assert.ok(outOfCatalog.recommendedProducts.length >= 1);
  assert.ok(outOfCatalog.recommendedProducts.length <= 2);
});
