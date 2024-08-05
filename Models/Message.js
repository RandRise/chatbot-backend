const db = require('../db');

const insertMessage = async (sessionKey, content, type) => {
    const query = `
        INSERT INTO messages (session_key, content, type) 
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [sessionKey, content, type];
    const { rows } = await db.query(query, values);
    return rows[0];
};

const getLastMessages = async (sessionKey, limit = 7) => {
    const query = `
        SELECT * FROM messages 
        WHERE session_key = $1 
        ORDER BY id DESC LIMIT $2`;

    const values = [sessionKey, limit];
    const { rows } = await db.query(query, values);
    return rows;
};

const fetchAllMessages = async (sessionKey) => {
    const query = `
        SELECT * FROM messages
        WHERE session_key = $1`;

    const values = [sessionKey];
    const { rows } = await db.query(query, values);
    return rows;
};

module.exports = {
    insertMessage,
    getLastMessages,
    fetchAllMessages
};
