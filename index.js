const scrapeProducts = require("./src/config/puppeteer");
require("dotenv").config();

scrapeProducts().catch((error) => {
	console.error("Error ejecutando el scraper:", error.message);
	process.exit(1);
});