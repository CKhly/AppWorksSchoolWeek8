const mongoose = require('mongoose')
let stationSchema = new mongoose.Schema({
    station: String,
    version: String,
    available: Number,
    location: { 
      type: {
        type: String,
        enum: ['Point'],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      },
    },
    datatime: { type: String, default: Date.now },
  });
stationSchema.index({ location: '2dsphere' });
const Station = mongoose.model('Station',stationSchema);
module.exports = Station;