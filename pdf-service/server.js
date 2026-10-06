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
  const { url, wait_for, filename } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Le paramètre "url" est obligatoire.' });
  }

  let browser;
  try {
    console.log(`[PDF Service] Generating PDF for: ${url}`);

    // Identique aux args utilisés dans generate_pdf_from_html.py
    const launchArgs = [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ];

    browser = await chromium.launch({
      headless: true,
      args: launchArgs,
    });

    const page = await browser.newPage();

    // Émuler le média d'impression (identique à Python : page.emulate_media(media="print"))
    await page.emulateMedia({ media: 'print' });

    console.log(`[PDF Service] Loading page: ${url}`);

    // Charger la page avec timeout de 30 secondes (identique à Python)
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    } catch (e) {
      console.warn(`[PDF Service] Warning: page.goto timed out: ${e.message}. Attempting PDF anyway.`);
    }

    // Attendre que le composant React signale être prêt (identique à Python)
    if (wait_for) {
      try {
        await page.waitForFunction(
          (signal) => window[signal] === true,
          wait_for,
          { timeout: 12000 }
        );
        console.log(`[PDF Service] Signal "${wait_for}" reçu, génération du PDF.`);
      } catch (e) {
        console.warn(`[PDF Service] Notice: "${wait_for}" wait skipped: ${e.message}`);
      }
    }

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
