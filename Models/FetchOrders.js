const { query } = require('../db');
const { convertToTimeZone } = require('../Utils/helper');

const getOrdersByUserId = async (userId) => {
    try {
        const queryText = `
            SELECT 
                o.id AS order_id,
                o.package_id,
                o.unitprice,
                o.createdate,
                p.name AS package_name,
                p.msgcount,
                p.numofmonths
            FROM 
                orders o
            JOIN 
                packages p ON o.package_id = p.id
            WHERE
                o.user_id = $1
        `;
        const result = await query(queryText, [userId]);

        const orders = result.rows.map(row => ({
            id: Number(row.order_id),
            package_id: Number(row.package_id),
            unitprice: parseFloat(row.unitprice),
            createdate: convertToTimeZone(row.createdate, 'Asia/Damascus'),
            package_name: row.package_name,
            msgcount: row.msgcount,
            numofmonths: row.numofmonths
        }));

        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

module.exports = {
    getOrdersByUserId,
};
