const express = require('express');
const path = require('path')
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { register, login, requestPasswordReset, resetPassword } = require('./Controllers/Authentication');
const verifyToken = require('./Middleware/Auth');
const { fetchPackages, fetchPaidPackages } = require('./Controllers/Package');
const { createOrder } = require('./Controllers/Order');
const { rechargeBotController } = require('./Controllers/Subscription');
const { fetchBots } = require('./Controllers/Bot');
const { fetchUserOrders } = require('./Controllers/FetchOrders');
const { sendMessage } = require('./Controllers/Message');
const RabbitMQService = require('./Services/RabbitMQService');
const { generateJsFile } = require('./Models/Bot');
const { registerSessionKey } = require('./Controllers/Session');
const { fetchAllMessagesController } = require('./Controllers/Message')
const {retrainChatbot} = require('./Controllers/Bot');

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.post('/register', register);
app.post('/login', login);
app.post('/forgot-password', requestPasswordReset);
app.post('/reset-password', resetPassword);
app.get('/get-packages', fetchPackages);
app.get('/get-paid-packages', fetchPaidPackages);
app.post('/create-order', verifyToken, createOrder);
app.post('/recharge-bot', verifyToken, rechargeBotController);
app.get('/get-bots', verifyToken, fetchBots);
app.get('/get-orders', verifyToken, fetchUserOrders);
app.post('/send-message', sendMessage);
app.post('/register-session-key', registerSessionKey);
app.post('/fetch-all-messages', fetchAllMessagesController);
app.post('/retrain-bot', verifyToken, retrainChatbot);

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    try {

        await RabbitMQService.connect();
        RabbitMQService.receiveMessage('training_response', generateJsFile);

    } catch (error) {

        console.error('Error connecting to RabbitMQ:', error);
    }
});
