const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const connectDB = require("./bd");
const fs = require("fs");
const LogitechMouse = require("../models/logitechModel");

const scrapeProducts = async () => {

  await connectDB();

  const url = "https://www.pccomponentes.com/search?query=raton%20logitech";

  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    await page.waitForSelector("#cookiesAcceptAll", { timeout: 5000 });
    await page.click("#cookiesAcceptAll");
  } catch {
    console.log("No apareció el popup de cookies");
  }

  await page.waitForSelector(".product-card");

  const products = await page.$$eval(".product-card", (cards) => {
    return cards.map(card => {

      const title =
        card.querySelector("h3")?.innerText.trim() || "";

      const price =
        card.innerText
          .split("\n")
          .find(text => text.includes("€")) || "";

      const img =
        card.querySelector("img")?.src || "";

      return { title, price, img };
    });
  });

  console.log(`Productos encontrados: ${products.length}`);

  fs.writeFileSync("ratonesLogitech.json", JSON.stringify(products, null, 2));

  await LogitechMouse.deleteMany({});
  await LogitechMouse.insertMany(products);

  console.log("Productos guardados ✅");

  await browser.close();
  await mongoose.connection.close();
};

module.exports = scrapeProducts;