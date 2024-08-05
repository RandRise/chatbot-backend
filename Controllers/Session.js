const { createResponse } = require("../Utils/responseUtils");
const { insertSession } = require('../Models/Session');
const registerSessionKey = async (req, res) => {

    const { bot_id, session_key } = req.body;
    if (!bot_id || !session_key) {

        return res.status(400).json(createResponse(400, 'Bot ID and Message ID are required.', {}))

    }
    try {

        const session = await insertSession(session_key, bot_id);

        return res.status(200).json(createResponse(200, 'Session registered successfully.', { session_key: session.session_key }));

    } catch (error) {

        console.error('Error registering session key: ', error);
        return res.status(500).json(createResponse(500, 'Failed to register session key.', {}));
    }
};

module.exports = {
    registerSessionKey,
}