const fetch = require("node-fetch")
const { connectMQ } = require('./mq')

async function getUbikeV1(){
    const response = await fetch('https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json');
    const data = await response.json();
    const stringData= JSON.stringify(data)
    return stringData;
}
async function main() {
    const channel = await connectMQ();
    var queue = 'ubikeV1_task_queue';
    channel.assertQueue(queue, {
        durable: true
    });
    const task = async () => {
        const msg = await getUbikeV1(); 
        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        });
        console.log(" [x] Sent");
        return
    }
    setInterval(()=> task(), 10000)
}
main();
