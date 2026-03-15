const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const connectDB = require("./bd");
const fs = require("fs");
const LogitechMouse = require("../models/logitechModel");

const scrapeProducts = async () => {

  await connectDB();

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
  );

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false
    });
  });

  const baseUrl = "https://www.pccomponentes.com/search?query=raton%20logitech&page=";

  let pageNum = 1;
  let allProducts = [];

  await page.goto(baseUrl + pageNum, { waitUntil: "networkidle2" });

  try {
    await page.waitForSelector("#cookiesAcceptAll", { timeout: 5000 });
    await page.click("#cookiesAcceptAll");
    console.log("Cookies aceptadas");
  } catch {
    console.log("No apareció el popup de cookies");
  }

  while (true) {

    await page.goto(baseUrl + pageNum, { waitUntil: "networkidle2" });

    await page.waitForSelector(".product-card", { timeout: 5000 }).catch(() => {});

    const products = await page.$$eval(".product-card", (cards) => {
      return cards.map(card => {

        const title = card.querySelector("h3")?.innerText.trim() || "";

        const price = card.innerText
          .split("\n")
          .find(text => text.includes("€")) || "";

        const img = card.querySelector("img")?.src || "";

        return { title, price, img };

      }).filter(p => p.title && p.price);
    });

    if (!products.length) break;

    console.log(`Página ${pageNum} scrapeada: ${products.length}`);

    allProducts = allProducts.concat(products);

    const doesntHaveNextPage = await page.$('div[class="emptyProductsContainer-idbdXP"]');
    if (doesntHaveNextPage) {
      console.log("No hay más páginas");
      break;
    }

    pageNum++;
  }

  fs.writeFileSync("ratonesLogitech.json", JSON.stringify(allProducts, null, 2));
  console.log("JSON creado ✅");

  await LogitechMouse.deleteMany({});
  await LogitechMouse.insertMany(allProducts);
  console.log("Guardado en MongoDB ✅");

  await browser.close();
  await mongoose.connection.close();
};

module.exports = scrapeProducts;