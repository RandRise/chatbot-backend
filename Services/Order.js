const { createOrder } = require('../Models/Order');
const { getPackageById } = require('../Models/Package');
const { getFreePackage } = require('../Models/Package')

const placeOrder = async (userId, packageId, domain) => {
    try {

        const package = await getPackageById(packageId);
        if (!package) {

            throw new Error('Package not found');
        }

        const unitPrice = package.price;
        const order = await createOrder(userId, packageId, unitPrice, domain);
        return order;

    } catch (error) {

        console.error('Error placing order:', error);
        throw new Error(error.detail);
    }
};

const placeFreeOrder = async (userId, domain) => {
    try {

        const package = await getFreePackage();
        if (!package) {

            throw new Error('Package not found');
        }

        const unitPrice = package.price;
        const order = await createOrder(userId, package.id, unitPrice, domain);
        return order;

    } catch (error) {

        console.error('Error placing order:', error);
        throw new Error(error.detail);
    }
};
module.exports = {
    placeOrder,
    placeFreeOrder,
};
