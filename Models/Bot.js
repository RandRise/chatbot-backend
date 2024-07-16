const { query } = require('../db');
const { convertToTimeZone } = require('../Utils/helper');

const getBotById = async (botId) => {
    const result = await query('SELECT * FROM bots WHERE id = $1', [botId]);
    return result.rows[0];
};

const getBots = async (userId) => {
    try {
        const queryText = `
            SELECT 
                b.id AS bot_id,
                b.domain,
                b.status,
                s.id AS subscription_id,
                s.msgcount,
                s.expirydate
            FROM 
                bots b
            LEFT JOIN 
                subscriptions s ON b.id = s.bot_id
            WHERE
                b.user_id = $1
        `;
        const result = await query(queryText, [userId]);

        const bots = result.rows.reduce((acc, row) => {
            const existingBot = acc.find(bot => bot.id === row.bot_id);
            if (existingBot) {
                existingBot.subscriptions.push({
                    id: Number(row.subscription_id),
                    msgcount: Number(row.msgcount),
                    expirydate: convertToTimeZone(row.expirydate, 'Asia/Damascus')
                });
            } else {
                acc.push({
                    id: Number(row.bot_id),
                    domain: row.domain,
                    status: row.status,
                    subscriptions: row.subscription_id
                        ? [{
                            id: Number(row.subscription_id),
                            msgcount: Number(row.msgcount),
                            expirydate: convertToTimeZone(row.expirydate, 'Asia/Damascus')
                        }]
                        : []
                });
            }
            return acc;
        }, []);

        return bots;
    } catch (error) {
        console.error('Error fetching bots:', error);
        throw error;
    }
};

const updateBotStatus = async (botId, newStatus) => {
    try {
        const updateQuery = `
            UPDATE bots
            SET status = $1
            WHERE id = $2
        `;
        const result = await query(updateQuery, [newStatus, botId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error updating bot status:', error);
        throw error;
    }
};


module.exports = {
    getBotById,
    getBots,
    updateBotStatus,
};
