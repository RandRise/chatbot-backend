// Models/Message.js
const db = require('../db');

const insertMessage = async (sessionKey, content, type) => {
    const query = `
        INSERT INTO messages (session_key, content, type) 
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [sessionKey, content, type];
    const { rows } = await db.query(query, values);
    return rows[0];
};

const getLastMessages = async (sessionKey, limit = 5) => {
    const query = `
        SELECT * FROM messages 
        WHERE session_key = $1 
        ORDER BY id DESC LIMIT $2`;
    const values = [sessionKey, limit];
    const { rows } = await db.query(query, values);
    // Sort the rows again in descending order based on id to ensure correct order
    const sortedRows = rows.sort((a, b) => a.id - b.id);
    console.log("Rows sorted again in DESC order: ", sortedRows);
    console.log("Rows ", rows);
    return rows;
};

module.exports = {
    insertMessage,
    getLastMessages,
};
