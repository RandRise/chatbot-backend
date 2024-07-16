const moment = require('moment-timezone');
const { getPackageById } = require('../Models/Package');
const { getCurrentSubscription, updateSubscription } = require('../Models/Subscription');
const { getBotById } = require('../Models/Bot');
const { convertToTimeZone } = require('../Utils/helper');

const rechargeBot = async (botId, packageId) => {
    // Check if the bot exists
    const bot = await getBotById(botId);
    if (!bot) {
        throw new Error('Bot not found');
    }

    // Retrieve the package details
    const packageDetails = await getPackageById(packageId);
    if (!packageDetails) {
        throw new Error('Package not found');
    }

    // Retrieve the current subscription details for the bot
    const currentSubscription = await getCurrentSubscription(botId);
    if (!currentSubscription) {
        throw new Error('Subscription not found');
    }

    // Calculate the new message count correctly as a number
    const newMsgCount = parseInt(currentSubscription.msgcount, 10) + parseInt(packageDetails.msgcount, 10);

    // Calculate the new expiry date
    const currentExpiryDate = moment.utc(currentSubscription.expirydate);
    const newExpiryDate = currentExpiryDate.add(packageDetails.numofmonths, 'months').utc().format('YYYY-MM-DD HH:mm:ss');

    // Update the subscription with the new message count and expiry date
    const updatedSubscription = await updateSubscription(currentSubscription.id, newMsgCount, newExpiryDate);

    // Format dates
    const formattedExpiryDate = convertToTimeZone(newExpiryDate, 'Asia/Damascus');

    return {
        subscription_id: updatedSubscription.id,
        bot_id: updatedSubscription.bot_id,
        new_msgcount: newMsgCount,
        new_expirydate: formattedExpiryDate
    };
};

module.exports = {
    rechargeBot,
};
