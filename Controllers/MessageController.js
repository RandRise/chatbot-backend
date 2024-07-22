const { createResponse } = require('../Utils/responseUtils');
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const { insertMessage, getLastMessages } = require('../Models/Message');
const { getSessionBySessionkey } = require('../Models/Session');

const sendMessage = async (req, res) => {
    const { message, session_key } = req.body;


    try {
        const session = await getSessionBySessionkey(session_key);
        console.log("Session", session);
        if (!session) {

            return res.status(500).json(createResponse(500, 'Session not found.', {}));
        }
        //Store the new message in the database
        await insertMessage(session_key, message, 1);


        //Retreive the last 5 messages from the same session


        const lastMessages = await getLastMessages(session_key);

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

                            //Store the response in the database
                            insertMessage(session_key, response.answer, 2)
                                .then(() => {

                                    setTimeout(() => connection.close(), 500);
                                    return res.status(200).json(createResponse(200, 'Message sent successfully.', response));
                                })
                                .catch(err => {
                                    console.error('Error inserting response into database: ', err);
                                    return res.status(500).json(createResponse(500, 'Failed to store response.', {}));
                                })
                        }
                    }, { noAck: true });

                    // Send the message to the request queue
                    const messageToSend = { question: message, correlationId, bot_id: session.bot_id, lastMessages };
                    console.log('Sending message:', messageToSend);
                    channel.sendToQueue('message_completion_request', Buffer.from(JSON.stringify(messageToSend)));
                });
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(createResponse(500, 'Failed to process message', {}));
    }
    // Generate a unique identifier
    function generateUuid() {
        return uuidv4();
    }
};

module.exports = {
    sendMessage,
};