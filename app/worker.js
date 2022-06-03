var amqp = require('amqplib/callback_api');
const mongoose = require('mongoose')
const { Schema } = mongoose;

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

const stationSchema = new Schema({
  station: String, // String is shorthand for {type: String}
  version: String,
  available: Number,
  location: { 
    type: {type: String}, 
    cordinates: [{ lat: Number, lng: Number }]
  },
    //datetime type should be Date
  datatime: { type: String, default: Date.now },
});
const Station = mongoose.model('Station',stationSchema);


amqp.connect('amqp://localhost:30000', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'task_queue';

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function(msg) {
      console.log(" [x] Received");
      const list = JSON.parse(msg.content.toString());
      // console.log(list.retVal[]);
      const res = await Station.deleteMany({});
      console.log("delete counts: ", res.deletedCount)
      for(var station in list.retVal){
        const stationInfo = new Station({
          station: list.retVal[station].sna,
          version: "v1",
          available: list.retVal[station].sbi,
          location: {
            type: "Point",
            cordinate: [list.retVal[station].lat, list.retVal[station].lng]
          },
          datatime: list.retVal[station].mday,
        })
        await stationInfo.save();
      }

      //consume data from rabbitmq channel (ubike 1.0 & 2.0)
      //transform the data to what we want and store it to mongodb
      //   console.log(" [x] Done");
      setTimeout(function() {
        console.log(" [x] Done");
        channel.ack(msg);
      }, 1000);
    }, {
      // manual acknowledgment mode,
      // see ../confirms.html for details
      noAck: false
    });
  });
});