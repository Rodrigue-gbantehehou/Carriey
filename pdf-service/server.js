const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.PDF_SERVICE_SECRET || null;

// ─── Middleware d'authentification ────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (API_SECRET) {
    const auth = req.headers['x-api-secret'];
    if (auth !== API_SECRET) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
  }
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'carriey-pdf-service' });
});

// ─── Endpoint principal : génération de PDF à partir d'une URL ────────────────
// POST /generate-pdf
// Body: { url: "https://...", wait_for: "__CV_PRINT_READY__", filename: "mon-cv.pdf" }
// Renvoie: fichier PDF binaire
app.post('/generate-pdf', async (req, res) => {
  const { url, html, wait_for, filename } = req.body;

  if (!url && !html) {
    return res.status(400).json({ error: 'Le paramètre "url" ou "html" est obligatoire.' });
  }

  let browser;
  try {
    // Identique aux args utilisés dans generate_pdf_from_html.py
    const launchArgs = [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--disable-web-security'
    ];

    browser = await chromium.launch({
      headless: true,
      args: launchArgs,
    });

    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Intercepter les logs React pour le debug !
    page.on('console', msg => console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser Error] ${err.message}`));
    page.on('requestfailed', request => console.log(`[Browser Request Failed] ${request.url()} - ${request.failure()?.errorText}`));

    // Émuler le média d'impression (identique à Python : page.emulate_media(media="print"))
    await page.emulateMedia({ media: 'print' });

    if (html) {
      console.log(`[PDF Service] Loading direct HTML (${html.length} chars)`);
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else if (url) {
      console.log(`[PDF Service] Loading page: ${url}`);
      // Charger la page avec domcontentloaded (rapide, ne bloque pas sur les requêtes résiduelles)
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      } catch (e) {
        console.warn(`[PDF Service] Warning: page.goto domcontentloaded timed out: ${e.message}. Attempting anyway.`);
      }
    }

    // Attendre que le composant React signale être prêt via le signal __CV_PRINT_READY__
    if (wait_for) {
      try {
        await page.waitForFunction(
          (signal) => window[signal] === true,
          wait_for,
          { timeout: 75000 } // 75s pour laisser à React le temps de s'hydrater sur le CPU partagé de Render
        );
        console.log(`[PDF Service] Signal "${wait_for}" reçu, génération du PDF.`);
      } catch (e) {
        console.error(`[PDF Service] ❌ Le signal "${wait_for}" n'a pas été reçu après 75s: ${e.message}`);
        throw new Error(`Le document n'a pas pu terminer son chargement (signal "${wait_for}" non reçu).`);
      }
    }

    // Attendre les polices
    try {
      await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve());
    } catch (e) {
      console.warn(`[PDF Service] Font wait skipped: ${e.message}`);
    }

    // Micro pause pour laisser le rendu graphique finaliser
    await new Promise(r => setTimeout(r, 400));

    // Générer le PDF A4 (identique à Python : format="A4", printBackground=True, margin=0)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const safeFilename = filename || 'carriey-document.pdf';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);

    console.log(`[PDF Service] ✅ PDF généré (${pdfBuffer.length} bytes) pour ${url}`);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error(`[PDF Service] ❌ Erreur: ${err.message}`);
    res.status(500).json({ error: `Echec de génération du PDF: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`[PDF Service] 🚀 Démarré sur le port ${PORT}`);
});
