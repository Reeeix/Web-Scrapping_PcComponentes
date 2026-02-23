const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const connectDB = require("./bd");
const fs = require("fs");

const logitechProduct = mongoose.model("logitechProduct", new mongoose.Schema({
    title: String,
    price: String,
    img: String
}))

const scrapeProducts = async () => {
    await connectDB();

    const baseSearchurl = "https://www.pccomponentes.com/search/?query=rat%C3%B3n+logitech&page=1&or-relevance&";

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    await page.goto(baseSearchurl, { waitUntil: "networkidle2" });

    //Aceptar cookies

    try {
      await page.waitForSelector('#cookiesAcceptAll');
      await page.click('#cookiesAcceptAll');
      console.log('Cookies aceptadas');
    } 
      catch (error) {
      console.log('No apareció el popup de cookies');
    };
    
    //Recoger la info de cada página

   let ratonesLogitech = [];
  //Según chatty esto lo debería de hacer más dinámico, de manera que detecte el número de páginas por si cambia
   for (let pageNum = 1; pageNum <= 9; pageNum++) {
   await page.goto(`https://www.pccomponentes.com/buscar/?query=raton+logitech&page=${pageNum}`, {
     waitUntil: "networkidle2"
   });

       const titles = await page.$$eval("h3[data-e2e='title-card']", (nodes) => {
        return nodes.map((n) => n.innerText.trim())
      });
       const prices = await page.$$eval('span[data-e2e="price-card"]', (nodes) => {
        return nodes.map((n) => n.innerText.trim())
      }) ;

      const imgs = await page.$$eval(".imageContainer-Odn8PL img", nodes => nodes.map(n => n.src)
      );

      const products = titles.map((value, index) => {
        return {
          title: value,
          price: prices[index],
          img: imgs[index]
        };
      });
      ratonesLogitech = ratonesLogitech.concat(products);
    }
    
      fs.writeFileSync('ratonesLogitech.json', JSON.stringify(ratonesLogitech, null, 2));
      console.log('Archivo ratonesLogitech.json creado ✅');
      
    //subir a mongo
     const data = JSON.parse(fs.readFileSync('ratonesLogitech.json', 'utf-8'));
     await logitechProduct.deleteMany({}); //Para que no me subais dos veces el archivo, que pesa bastante
     await logitechProduct.insertMany(data);
     console.log('Productos guardados en MongoDB ✅');


  //  Cerrar navegador
      await browser.close();
      console.log('Navegador cerrado ✅');
  };

module.exports = scrapeProducts;