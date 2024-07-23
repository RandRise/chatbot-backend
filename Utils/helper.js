const moment = require('moment-timezone');

const retrieveCurrency = () => {
    
    return "USD";
}

const convertToTimeZone = (utcDateTime, targetTimeZone) => {
    return moment.utc(utcDateTime)
        .tz(targetTimeZone)
        .format('YYYY-MM-DD HH:mm:ss');
};

module.exports = {
    retrieveCurrency,
    convertToTimeZone,
}