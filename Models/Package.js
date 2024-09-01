const { retrieveCurrency } = require('../Utils/helper');
const { query } = require('../db');

const getPackages = async () => {

    const result = await query('SELECT * FROM packages');

    return result.rows.map(row => ({

        id: row.id,
        name: row.name,
        msgcount: row.msgcount,
        numofmonths: row.numofmonths,
        formattedPrice: row.price + ' ' + retrieveCurrency(),
        price: parseFloat(row.price),

    }));

};

const getPackageById = async (packageId) => {

    const result = await query(`SELECT * FROM packages WHERE id = $1`, [packageId]);

    if (result.rows.length === 0) {

        return null;
    }
    const row = result.rows[0];

    return {
        
        id: row.id,
        name: row.name,
        msgcount: row.msgcount,
        numofmonths: row.numofmonths,
        formattedPrice: row.price + ' ' + retrieveCurrency(),
        price: parseFloat(row.price),
    };
};

const getPaidPackages = async () => {

    const result = await query('SELECT * FROM packages WHERE is_default = false');

    return result.rows.map(row => ({

        id: row.id,
        name: row.name,
        msgcount: row.msgcount,
        numofmonths: row.numofmonths,
        formattedPrice: row.price + ' ' + retrieveCurrency(),
        price: parseFloat(row.price),

    }));

};

module.exports = {
    getPackages,
    getPackageById,
    getPaidPackages,
};