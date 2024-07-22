const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = await amqp.connect('amqp://localhost');
            console.log('Connected to RabbitMQ');
        }
        if (!this.channel) {
            this.channel = await this.connection.createChannel();
        }
        return this.connection;  // Return connection for later use in closing
    }

    async assertQueue(queue, options = { durable: false }) {
        await this.connect();
        return this.channel.assertQueue(queue, options);
    }

    async sendMessage(queue, message) {
        await this.connect();
        await this.assertQueue(queue);
        await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`[x] Sent message to queue '${queue}': ${JSON.stringify(message)}`);
    }

    async receiveMessage(queue, callback) {
        await this.connect();
        await this.assertQueue(queue, { durable: true });
        this.channel.consume(queue, (msg) => {
            if (msg !== null) {
                const response = JSON.parse(msg.content.toString());
                console.log("Received Message",msg.content.toString());
                callback(response.bot_id);
                this.channel.ack(msg);
            }
        });
        console.log(`[*] Waiting for messages in '${queue}'`);
    }
    async close(connection) {
        if (this.channel) {
            await this.channel.close();
            console.log('Closed RabbitMQ channel');
        }
        if (connection) {
            await connection.close();
            console.log('Closed RabbitMQ connection');
        }
    }
}

module.exports = new RabbitMQService();
