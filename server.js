const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { register, login, requestPasswordReset, resetPassword } = require('./Controllers/Authentication');
const verifyToken = require('./middleware/Auth');
const { fetchPackages } = require('./Controllers/Package');
const { createOrder } = require('./Controllers/Order');
const { rechargeBotController } = require('./Controllers/Subscription');
const { fetchBots } = require('./Controllers/Bot');
const { fetchUserOrders } = require('./Controllers/FetchOrders');
const { sendMessage, handleResponse } = require('./Controllers/MessageController');
const RabbitMQService = require('./Services/RabbitMQService');


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

// Route setup
app.post('/register', register);
app.post('/login', login);
app.post('/forgot-password', requestPasswordReset);
app.post('/reset-password', resetPassword);
app.get('/get-packages', fetchPackages);
app.post('/create-order', verifyToken, createOrder);
app.post('/recharge-bot', verifyToken, rechargeBotController);
app.get('/get-bots', verifyToken, fetchBots);
app.get('/get-orders', verifyToken, fetchUserOrders);
app.post('/send-message', sendMessage);

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    try {
        await RabbitMQService.connect();
        // add all consumers here
        RabbitMQService.receiveMessage('response_queue', handleResponse);
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
});