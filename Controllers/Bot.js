const { getBots } = require('../Models/Bot');
const { createResponse } = require('../Utils/responseUtils');

const fetchBots = async (req, res) => {
    const userId = req.user.id; // Ensure the userId is fetched from the authenticated user

    try {
        const bots = await getBots(userId);
        if (bots.length === 0) {
            return res.status(404).json(createResponse(404, 'No bots found', []));
        }
        return res.status(200).json(createResponse(200, 'Bots Fetched', bots));
    } catch (error) {
        console.error('Error fetching bots:', error);
        return res.status(500).json(createResponse(500, 'Server Error', null));
    }
};

module.exports = {
    fetchBots,
};
