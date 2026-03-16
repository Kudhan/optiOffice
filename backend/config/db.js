const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If MONGO_URI doesn't end with a specific DB, or we want to force it based on the prompt:
    const uri = process.env.MONGO_URI.includes('?') 
      ? process.env.MONGO_URI.replace('?', 'optioffice_db?') 
      : `${process.env.MONGO_URI}/optioffice_db`;
      
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected to OptiOffice DB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
