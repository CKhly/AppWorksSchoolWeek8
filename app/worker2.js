var amqp = require('amqplib/callback_api');

const { connectDB } = require('./db')
const Station = require("./model");

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'ubikeV2_task_queue';
    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function(msg) {
      console.log(" [x] Received");
      //consume data from rabbitmq channel (ubike 1.0 & 2.0)
      const list = JSON.parse(msg.content.toString());
      connectDB();
      for(var station of list){
        const stationInfo = new Station({
          station: station.sna,
          version: "v2",
          available: station.sbi,
          location: {
            coordinates: [
              station.lng,
              station.lat
            ]
          },
          datatime: station.mday,
        })
        const id = parseInt(station.sno, 10);
        //transform the data to what we want and store it to mongodb
        Station.findOneAndUpdate({ _id: id }, { _id: id, ...stationInfo },{
          new: true,
          upsert: true // Make this update into an upsert
        } ,function(error, result) {
          if (error) {
            console.log(error);
          }
        });
      }
      console.log("data insert!")
      setTimeout(function() {
        console.log(" [x] Done");
        channel.ack(msg);
      }, 1000);
    }, {
      noAck: false
    });
  });
});