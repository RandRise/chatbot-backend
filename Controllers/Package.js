const { getPackages } = require('../Models/Package');
const { createResponse } = require('../Utils/responseUtils');

const fetchPackages = async (req, res) => {
    try {
        const packages = await getPackages();
        return res.status(200).json(createResponse(200, 'Packages Fetched', packages));
    } catch (error) {

        return res.status(500).json(createResponse(500, 'Server Error', null));

    }
}

module.exports = {
    fetchPackages,
}