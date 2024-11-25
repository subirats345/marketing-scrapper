require("dotenv").config();
const express = require("express");
const { chromium } = require("playwright");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 solicitudes por IP
  message: "Too many requests, please try again later.",
});
app.use("/scrape", limiter);

// Scraping Endpoint
app.get("/scrape", async (req, res) => {
  const { url, token } = req.query;

  // Verificar token
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Verificar URL
  if (!url) {
    return res
      .status(400)
      .json({ error: "Please provide a URL as a query parameter." });
  }

  try {
    // Lanzar navegador
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Configurar agente de usuario para evitar bloqueos
    await page.setUserAgent("Mozilla/5.0 ... Chrome/91.0 Safari/537.36");

    // Ir a la página
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Manejar cookies (si aplica)
    const cookieButton = await page.$('button:has-text("Accept")');
    if (cookieButton) {
      await cookieButton.click();
    }

    // Extraer contenido
    const content = await page.content();

    // Cerrar navegador
    await browser.close();

    // Enviar respuesta
    res.json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape the page." });
  }
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
