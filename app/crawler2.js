const fetch = require("node-fetch");
var amqp = require('amqplib/callback_api');

setInterval(async()=>{
    const response = await fetch('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json');
    const data = await response.json();
    const stringData= JSON.stringify(data)
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            var queue = 'ubikeV2_task_queue';
            var msg = stringData;
            channel.assertQueue(queue, {
                durable: true
            });
            channel.sendToQueue(queue, Buffer.from(msg), {
                persistent: true
            });
            console.log(" [x] Sent");
        });
        // setTimeout(function() {
        //     connection.close();
        //     process.exit(0)
        // }, 500);
    });
}, 2000)




// app.get("/", async (req,res)=>{
//     const response = await fetch('https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json');
//     const data = await response.json();
//     console.log(data)
//     res.send(data)
// })

// app.listen(3000,'0.0.0.0',()=>{
//     console.log("Listening on port 3000")
// })

