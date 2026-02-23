const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const connectDB = require("./src/config/bd");
const scrapeProducts = require("./src/config/puppeteer");
require("dotenv").config();


scrapeProducts();