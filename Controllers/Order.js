const { placeOrder } = require('../Services/Order');
const { createResponse } = require('../Utils/responseUtils');

const createOrder = async (req, res) => {

    const { packageId, domain } = req.body;
    const userId = req.user.id;


    try {

        const order = await placeOrder(userId, packageId, domain);
        return res.status(200).json(createResponse(200, 'Order created successfully', order));

    } catch (error) {

        return res.status(500).json(createResponse(500, 'Failed to place order', error.message));
    };

};

module.exports = {
    createOrder,
};