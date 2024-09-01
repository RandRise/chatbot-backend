const { getOrdersByUserId, getOrders } = require('../Models/FetchOrders');
const { createResponse } = require('../Utils/responseUtils');

const fetchUserOrders = async (req, res) => {
    const userId = req.user.id;

    try {

        const orders = await getOrdersByUserId(userId);
        return res.status(200).json(createResponse(200, 'Orders Fetched', orders));

    } catch (error) {

        console.error('Error fetching user orders:', error);
        return res.status(500).json(createResponse(500, 'Server Error', null));
    }
};

const fetchAllOrders = async (req, res) => {

    try {

        const orders = await getOrders();
        return res.status(200).json(createResponse(200, 'Orders Fetched', orders));

    } catch (error) {

        console.error('Error fetching user orders:', error);
        return res.status(500).json(createResponse(500, 'Server Error', null));
    }
};

module.exports = {
    fetchUserOrders,
    fetchAllOrders,
};
