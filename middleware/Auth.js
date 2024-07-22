const jwt = require('jsonwebtoken');
const { createResponse } = require('../Utils/responseUtils');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json(createResponse(401, 'Access Denied: No Token Provided', null));

    }
    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET)
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json(createResponse(401, 'Invalid Token', null));
    }
};

module.exports = verifyToken;