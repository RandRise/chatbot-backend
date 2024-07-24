const amqp = require('amqplib');
const { reduceMessageCount } = require('../Services/Subscription')
class RabbitMQService {
    constructor() {

        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if (!this.connection) {

            this.connection = await amqp.connect('amqp://localhost');
        }
        if (!this.channel) {

            this.channel = await this.connection.createChannel();
        }
        return this.connection;
    }

    async assertQueue(queue, options = { durable: false }) {

        await this.connect();
        return this.channel.assertQueue(queue, options);
    }

    async receiveMessage(queue, callback) {

        await this.connect();
        await this.assertQueue(queue, { durable: true });
        this.channel.consume(queue, (msg) => {

            if (msg !== null) {
                const response = JSON.parse(msg.content.toString());
                callback(response.bot_id);
                this.channel.ack(msg);
            }

        });
        console.log(`[*] Waiting for messages in '${queue}'`);
    }
    async close(connection) {

        if (this.channel) {

            await this.channel.close();
        }

        if (connection) {

            await connection.close();
        }
    }
}

module.exports = new RabbitMQService();
