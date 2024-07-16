const { query } = require('../db');

const getCurrentSubscription = async (botId) => {
    const result = await query(
        'SELECT * FROM subscriptions where bot_id = $1 ORDER BY expirydate DESC LIMIT 1',
        [botId]
    );
    return result.rows[0];
};

const updateSubscription = async (subscriptionId, msgCount, expiryDate) => {
    const result = await query(
        'UPDATE subscriptions SET msgcount = $1, expirydate = $2 WHERE id = $3 RETURNING *',
        [msgCount, expiryDate, subscriptionId]
    );
    return result.rows[0];
};

module.exports = {
    getCurrentSubscription,
    updateSubscription,
}