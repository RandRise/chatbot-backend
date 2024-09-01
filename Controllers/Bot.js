const { getBots } = require('../Models/Bot');
const { createResponse } = require('../Utils/responseUtils');
const { retrainBot } = require('../Models/Order');
const fetchBots = async (req, res) => {

    const userId = req.user.id;

    try {

        const bots = await getBots(userId, req);

        if (bots.length === 0) {

            return res.status(404).json(createResponse(404, 'No bots found', []));
        }

        return res.status(200).json(createResponse(200, 'Bots Fetched', bots));
    } catch (error) {

        console.error('Error fetching bots:', error);
        return res.status(500).json(createResponse(500, 'Server Error', null));
    }
};

const retrainChatbot = async (req, res) => {
    const { botId } = req.body;
    try {
        console.log("BOT ID", botId)
        await retrainBot(botId);
        return res.status(200).json(createResponse(200, 'Your bot is up to date', null));
    } catch (error) {

        console.error('Error bots:', error);
        return res.status(500).json(createResponse(500, 'Error updating bot', null));
    }
}

module.exports = {
    fetchBots,
    retrainChatbot
};
