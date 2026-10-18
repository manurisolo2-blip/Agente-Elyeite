<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EL YEITE · Taller de Muebles
## Asesor de Compras Multimodal con Gemini 2.5 Flash

Aplicación interactiva y multimodal para el asesoramiento y venta de muebles de diseño, maderas nobles y tapicería a medida.

### Características
- **Identidad de Marca Oficial:** BRAND_CONFIG oficial de El Yeite con catálogo de 15 productos, curaduría de maderas macizas, tapizados antimanchas y el Sillón Sure como producto estrella.
- **Multimodalidad 24/7:** Análisis visual en vivo de fotografías (ambientes, livings, espacios reducidos) mediante `gemini-2.5-flash` con timeout optimizado y fallback determinístico.
- **Full-Stack Integrado:** Servidor backend Express con Vite SPA, Tailwind CSS v4 y tests automatizados.

### Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar la clave de API en `.env`:
   ```bash
   GEMINI_API_KEY=tu_api_key_aqui
   ```
3. Ejecutar los tests unitarios:
   ```bash
   npm test
   ```
4. Iniciar el servidor de desarrollo en puerto 3000:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.