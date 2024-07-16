const { createOrder } = require('../Models/Order');
const { getPackageById } = require('../Models/Package');

const placeOrder = async (userId, packageId, domain) => {
    try {
        const package = await getPackageById(packageId);
        if (!package) {
            throw new Error('Package not found');
        }

        const unitPrice = package.price;
        const order = await createOrder(userId, packageId, unitPrice, domain); // Default status to active
        return order;
    } catch (error) {
        console.error('Error placing order:', error);
        throw new Error(error.detail);
    }
};

module.exports = {
    placeOrder,
};
