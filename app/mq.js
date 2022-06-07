var amqplib = require('amqplib');
require('dotenv').config()
const { RABBITMQ_HOST, RABBITMQ_PORT, NODE_ENV } = process.env;

const connectMQ = async () => {
    const host = NODE_ENV === 'Deployment' ? RABBITMQ_HOST : 'localhost';
    const connection = await amqplib.connect(`amqp://${host}:${RABBITMQ_PORT}`)
    const channel = await connection.createChannel();
    return channel;
}
module.exports = { connectMQ };