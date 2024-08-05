const { createResponse } = require('../Utils/responseUtils');
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');
const { insertMessage, getLastMessages, fetchAllMessages } = require('../Models/Message');
const { getSessionBySessionkey } = require('../Models/Session');
const { validateSubscriptionAndManageQuota } = require('../Services/Subscription')

const sendMessage = async (req, res) => {

    const { message, session_key } = req.body;

    try {
        const session = await getSessionBySessionkey(session_key);
        if (!session) {

            return res.status(500).json(createResponse(500, 'Session not found.', {}));
        }

        const validationResponse = await validateSubscriptionAndManageQuota(session.bot_id);
        if (validationResponse == false)
            return res.status(500).json(createResponse(500, 'Something wrong. Please contact website support', {}));

        await insertMessage(session_key, message, 1);

        const lastMessages = await getLastMessages(session_key);

        amqp.connect('amqp://localhost', function (error0, connection) {

            if (error0) {

                console.error('Connection error:', error0);
                return res.status(500).json(createResponse(500, 'Failed to connect to RabbitMQ.', {}));
            }

            connection.createChannel(function (error1, channel) {

                if (error1) {

                    console.error('Channel creation error:', error1);
                    return res.status(500).json(createResponse(500, 'Failed to create RabbitMQ channel.', {}));
                }

                channel.assertQueue('gpt_response_queue', { durable: true }, function (error2, q) {

                    if (error2) {

                        console.error('Queue assertion error:', error2);
                        return res.status(500).json(createResponse(500, 'Failed to assert RabbitMQ queue.', {}));
                    }

                    const correlationId = generateUuid();

                    channel.consume(q.queue, function (msg) {

                        const response = JSON.parse(msg.content.toString());

                        if (response.correlationId === correlationId) {

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

                    const messageToSend = { question: message, correlationId, bot_id: session.bot_id, lastMessages };
                    channel.sendToQueue('message_completion_request', Buffer.from(JSON.stringify(messageToSend)));
                });
            });
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json(createResponse(500, 'Failed to process message', {}));
    }



    function generateUuid() {

        return uuidv4();
    }
};

const fetchAllMessagesController = async (req, res) => {
    const { session_key } = req.body;

    try {
        const messages = await fetchAllMessages(session_key);
        return res.status(200).json(createResponse(200, 'Messages fetched successfully.', { messages }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json(createResponse(500, 'Failed to fetch messages', {}));
    }
};

module.exports = {
    sendMessage,
    fetchAllMessagesController
};