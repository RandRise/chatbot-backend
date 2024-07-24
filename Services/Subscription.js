const moment = require('moment-timezone');
const { getPackageById } = require('../Models/Package');
const { getCurrentSubscription, updateSubscription } = require('../Models/Subscription');
const { getBotById } = require('../Models/Bot');
const { convertToTimeZone } = require('../Utils/helper');

const rechargeBot = async (botId, packageId) => {

    const bot = await getBotById(botId);

    if (!bot) {

        throw new Error('Bot not found');
    }

    const packageDetails = await getPackageById(packageId);
    if (!packageDetails) {

        throw new Error('Package not found');
    }

    const currentSubscription = await getCurrentSubscription(botId);
    if (!currentSubscription) {

        throw new Error('Subscription not found');
    }

    const newMsgCount = parseInt(currentSubscription.msgcount, 10) + parseInt(packageDetails.msgcount, 10);

    const currentExpiryDate = moment.utc(currentSubscription.expirydate);
    const newExpiryDate = currentExpiryDate.add(packageDetails.numofmonths, 'months').utc().format('YYYY-MM-DD HH:mm:ss');
    const updatedSubscription = await updateSubscription(currentSubscription.id, newMsgCount, newExpiryDate);
    const formattedExpiryDate = convertToTimeZone(newExpiryDate, 'Asia/Damascus');

    return {

        subscription_id: updatedSubscription.id,
        bot_id: updatedSubscription.bot_id,
        new_msgcount: newMsgCount,
        new_expirydate: formattedExpiryDate
    };
};

const validateSubscriptionAndManageQuota = async (botId) => {
    try {
        const currentSubscription = await getCurrentSubscription(botId);
        const now = moment.utc();
        const currentExpiryDate = moment(currentSubscription.expirydate);
        console.log("Expiration Date UTC",currentExpiryDate);
        console.log("Now", now)

        if (now.isAfter(currentExpiryDate)){
            console.log("Subscription Expired");
            return false;
        }
        if (currentSubscription && currentSubscription.msgcount > 0) {
            const newMsgCount = currentSubscription.msgcount - 1;
            await updateSubscription(currentSubscription.id, newMsgCount, currentSubscription.expirydate);
            console.log(`[x] Decreased message count for bot_id: ${botId}`);
        } else {
            console.log(`No active subscription found or Quota exceeded for Web-Bot number: ${botId}`);
        }
    } catch (err) {
        console.error("Error decreasing message count:", err);
    }
};

module.exports = {
    rechargeBot,
    validateSubscriptionAndManageQuota,
};
