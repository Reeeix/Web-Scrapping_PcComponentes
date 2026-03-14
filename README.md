# Web Scrapping con profesor 2

Scraper de productos de **raton logitech** en PcComponentes usando Puppeteer, con guardado en archivo JSON y en MongoDB.

## Requisitos

- Node.js 18+
- MongoDB accesible
- Variable de entorno `MONGO_URI` en archivo `.env`

Ejemplo de `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/webscraping
```

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run start
```

Tambien puedes usar:

```bash
npm run scrape
```

## Que hace el script

1. Se conecta a MongoDB con `await`.
2. Abre PcComponentes y acepta cookies si aparece el popup.
3. Recorre la paginacion **hasta el final** (sin limite fijo de paginas).
4. Espera a que carguen las cards de producto antes de extraer datos.
5. Extrae `title`, `price` e `img` con selectores robustos.
6. Guarda los resultados en `ratonesLogitech.json`.
7. Limpia e inserta datos en la coleccion `mouses`.
8. Cierra navegador y conexion a MongoDB en bloque `finally`.

## Estructura

- `index.js`: punto de entrada.
- `src/config/bd.js`: conexion a MongoDB.
- `src/config/puppeteer.js`: logica de scraping.
- `src/models/logitechModel.js`: modelo Mongoose.
- `ratonesLogitech.json`: salida del scrape.

## Errores comunes

- Si no se encuentran productos, revisa la URL base y los selectores.
- Si falla MongoDB, revisa `MONGO_URI` y que la base este levantada.
