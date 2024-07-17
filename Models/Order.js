const { query } = require('../db');
const moment = require('moment-timezone');
const { convertToTimeZone, retrieveCurrency } = require('../Utils/helper');
const { getPackageById } = require('./Package');
const RabbitMQService = require('../Services/RabbitMQService');

const domainPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,24}(\/)?$/;

const isValidDomain = (domain) => {
    return domainPattern.test(domain);
};

const createOrder = async (userId, packageId, unitPrice, domain) => {
    try {
        if (!isValidDomain(domain)) {
            throw new Error('Invalid domain format');
        }

        const nowUtc = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        const insertOrderResult = await query(
            'INSERT INTO orders (user_id, package_id, unitprice, createdate) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, packageId, unitPrice, nowUtc]
        );
        const order = insertOrderResult.rows[0];

        const botStatus = 2; // Initial status is pending
        const insertBotResult = await query(
            'INSERT INTO bots (user_id, domain, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, domain, botStatus]
        );
        const bot = insertBotResult.rows[0]; //Send to queue request_training

        const packageDetails = await getPackageById(packageId);
        const expiryDate = moment(nowUtc).add(packageDetails.numofmonths, 'months').utc().format('YYYY-MM-DD HH:mm:ss');

        const insertSubscriptionResult = await query(
            'INSERT INTO subscriptions (bot_id, msgcount, expirydate) VALUES ($1, $2, $3) RETURNING *',
            [bot.id, packageDetails.msgcount, expiryDate]
        );
        const subscription = insertSubscriptionResult.rows[0];

        const selectOrderResult = await query(
            'SELECT o.id, o.user_id, o.package_id, o.unitprice, o.createdate, p.name AS package_name ' +
            'FROM orders o ' +
            'JOIN packages p ON o.package_id = p.id ' +
            'WHERE o.id = $1',
            [order.id]
        );
        const orderWithDetails = selectOrderResult.rows[0];

        const formattedDate = convertToTimeZone(orderWithDetails.createdate, 'Asia/Damascus');

        RabbitMQService.sendMessage('training_request', JSON.stringify(bot));
        

        return {
            id: orderWithDetails.id,
            user_id: orderWithDetails.user_id,
            package_id: orderWithDetails.package_id,
            unitprice: orderWithDetails.unitprice + ' ' + retrieveCurrency(),
            createdate: formattedDate,
            package_name: orderWithDetails.package_name,
            bot_id: bot.id,
            bot_status: bot.status,
            subscription_id: subscription.id,
            subscription_msgcount: subscription.msgcount,
            subscription_expirydate: convertToTimeZone(subscription.expirydate, 'Asia/Damascus')
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

module.exports = {
    createOrder,
};
