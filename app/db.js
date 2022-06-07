const mongoose = require('mongoose');
require('dotenv').config()
const { MONGODB_HOST, MONGODB_PORT, MONGODB_USER, MONGODB_PASS, MONGODB_DB, NODE_ENV } = process.env;

const connectDB = async () => {
  const host = NODE_ENV === 'Deployment' ? MONGODB_HOST : 'localhost';
  const url = `mongodb://${host}:${MONGODB_PORT}/${MONGODB_DB}`;
  try {
    // const conn = await mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
    const conn = await mongoose.connect( url, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('MongoDB Connected')
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
module.exports = {connectDB};