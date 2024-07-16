const { createResponse } = require('../Utils/responseUtils');
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');

const sendMessage = async (req, res) => {
    const { message } = req.body;

    // Establish connection to RabbitMQ
    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            console.error('Connection error:', error0);
            return res.status(500).json(createResponse(500, 'Failed to connect to RabbitMQ.', {}));
        }
        console.log('Connected to RabbitMQ');

        // Create channel
        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.error('Channel creation error:', error1);
                return res.status(500).json(createResponse(500, 'Failed to create RabbitMQ channel.', {}));
            }
            console.log('Channel created');

            // Ensure the response queue exists
            channel.assertQueue('gpt_response_queue', { durable: true }, function (error2, q) {
                if (error2) {
                    console.error('Queue assertion error:', error2);
                    return res.status(500).json(createResponse(500, 'Failed to assert RabbitMQ queue.', {}));
                }

                const correlationId = generateUuid();

                // Consume messages from the response queue
                channel.consume(q.queue, function (msg) {
                    console.log('Received message:', msg.content.toString());
                    const response = JSON.parse(msg.content.toString());
                    if (response.correlationId === correlationId) {
                        console.log('Response answer:', response.answer);
                        res.status(200).json(createResponse(200, 'Message sent successfully.', response));
                        setTimeout(() => connection.close(), 500);
                    }
                }, { noAck: true });

                // Send the message to the request queue
                const messageToSend = { question: message, correlationId };
                console.log('Sending message:', messageToSend);
                channel.sendToQueue('message_completion_request', Buffer.from(JSON.stringify(messageToSend)));
            });
        });
    });

    // Generate a unique identifier
    function generateUuid() {
        return uuidv4();
    }
};

module.exports = {
    sendMessage,
};