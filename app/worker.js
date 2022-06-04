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
    var queue = 'ubikeV1_task_queue';
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
      const res = await Station.deleteMany({});
      console.log("delete counts: ", res.deletedCount)
      for(var station in list.retVal){
        const stationInfo = new Station({
          station: list.retVal[station].sna,
          version: "v1",
          available: list.retVal[station].sbi,
          location: {
            coordinates: [
              list.retVal[station].lng,
              list.retVal[station].lat
            ]
          },
          datatime: list.retVal[station].mday,
        })
        //transform the data to what we want and store it to mongodb
        await stationInfo.save();
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