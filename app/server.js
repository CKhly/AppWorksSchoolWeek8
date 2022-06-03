const express = require("express");
const app = express();
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/test')
      console.log('MongoDB Connected')
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
connectDB();