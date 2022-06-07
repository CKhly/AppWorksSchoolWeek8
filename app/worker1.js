const { connectDB } = require('./db')
const { connectMQ } = require('./mq')
const Station = require("./model");

async function main() {
  const channel = await connectMQ();
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
      const id = parseInt(list.retVal[station].sno, 10);
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
}
main();