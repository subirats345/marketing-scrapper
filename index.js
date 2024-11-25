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

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });
    const content = await page.content();

    await browser.close();
    res.json({ content });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      error: "Failed to scrape the page.",
      details: error.message,
    });
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
