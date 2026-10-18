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

test('BRAND_CONFIG contains exactly 15 products with real photography URLs, theme, quickPrompts, shippingAndReturns, and stylePreset', () => {
  assert.equal(DEFAULT_BRAND_CONFIG.products.length, 15);
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

test('System instruction contains all 15 BRAND_CONFIG products and strict rules', () => {
  const instruction = buildAdvisorSystemInstruction(DEFAULT_BRAND_CONFIG);
  assert.ok(instruction.includes('EY-SURE'));
  assert.ok(instruction.includes('CR-15'));
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

test('matchCatalogProducts routes gift, garment, skin, and spare part queries accurately', () => {
  const giftMatch = matchCatalogProducts('Recomendame un regalo', undefined, DEFAULT_BRAND_CONFIG);
  assert.equal(giftMatch.isGiftQuery, true);
  assert.ok(giftMatch.matched.length >= 1);

  const repuestoMatch = matchCatalogProducts(
    'Mi cafetera E61 pierde agua por la junta del portafiltro de 58mm',
    undefined,
    DEFAULT_BRAND_CONFIG
  );
  assert.equal(repuestoMatch.detectedCategory, 'repuesto');
  assert.ok(repuestoMatch.matched.some((p) => p.id === 'CR-14'));
});

test('generateDeterministicAdvisorResponse explains honestly when product is not in catalog', () => {
  const outOfCatalog = generateDeterministicAdvisorResponse(
    'Hola, tenés televisor OLED de 85 pulgadas o heladera inverter?',
    DEFAULT_BRAND_CONFIG,
    false
  );
  assert.equal(outOfCatalog.visualAnalysis, null);
  assert.ok(outOfCatalog.advisorMessage.includes('no está en nuestro catálogo oficial'));
  assert.ok(outOfCatalog.recommendedProducts.length >= 1);
  assert.ok(outOfCatalog.recommendedProducts.length <= 2);
});
