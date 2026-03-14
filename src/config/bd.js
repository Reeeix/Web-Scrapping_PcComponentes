const mongoose = require("mongoose");

const connectDB = async () => {
   try {
     await mongoose.connect(process.env.MONGO_URI);
     console.log("Conectados con éxito a la BD ✅");
     
   } catch (error) {
    console.log("❌ No se ha podido realizar la conexión");
    console.log(error);
    throw error;
    
   }
};

module.exports = connectDB;