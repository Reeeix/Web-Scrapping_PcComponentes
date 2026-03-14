const mongoose = require("mongoose")

const logitechSchema = new mongoose.Schema ( {
    title: String,
    price: String,
    img: String
});

const LogitechMouse = mongoose.model("mouses", logitechSchema, "mouses");

module.exports = LogitechMouse;