const { createOrder } = require('../Models/Order');
const { getPackageById } = require('../Models/Package');
const { getFreePackage } = require('../Models/Package')
const stripe = require('stripe')
('sk_test_51PzPPtJi4fqiBN462OigNpZD6G6xIFC3g9OPfeSMKgvJn3ijIxSoa45mzqVQKOw5xhNdnyH9s66Gmvd1JwRW7zva00pBXC8173')

const placeOrder = async (userId, packageId, domain) => {
    try {

        const package = await getPackageById(packageId);
        if (!package) {

            throw new Error('Package not found');
        }

        const unitPrice = package.price;
        const order = await createOrder(userId, packageId, unitPrice, domain);
        const redirectURL = stripePayment(package)
        return redirectURL;


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
const stripePayment = async (package) => {
   
    try {
        const priceInCents = Math.round(package.price * 100); // e.g., 19.99 becomes 1999
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: package.name,
                        description: `This Plan Provides${package.msgcount}`,
                    },
                    unit_amount: priceInCents, // Price in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3001/user/bots',
            cancel_url: 'http://localhost:3001/cancel',
        });
        console.log(session.url)
        return (session.url);
        
        
    
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    placeOrder,
    placeFreeOrder,
    stripePayment
};
