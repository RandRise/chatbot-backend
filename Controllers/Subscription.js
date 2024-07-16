const { rechargeBot } = require('../Services/Subscription');
const { getPackageById } = require('../Models/Package');
const { createResponse } = require('../Utils/responseUtils');

const rechargeBotController = async (req, res) => {
    const { botId, packageId } = req.body;

    try {
        // Check if the package exists
        const package = await getPackageById(packageId);
        if (!package) {
            return res.status(404).json(createResponse(404, 'Package Not Found'));
        }

        // Recharge the bot
        const updatedSubscription = await rechargeBot(botId, packageId);
        return res.status(200).json(createResponse(200, 'Bot Recharged Successfully', { subscriptions: updatedSubscription }));

    } catch (error) {
        console.error('Error recharging bot:', error);

        // Handle specific errors
        if (error.message === 'Bot not found') {
            return res.status(404).json(createResponse(404, 'Bot Not Found'));
        } else if (error.message === 'Subscription not found') {
            return res.status(404).json(createResponse(404, 'Subscription Not Found'));
        } else {
            return res.status(500).json(createResponse(500, 'Server Error'));
        }
    }
};

module.exports = {
    rechargeBotController,
};
