const db = require("../db");

const insertSession = async (session_key, bot_id) => {
    const query = `
    INSERT into sessions(
    session_key,
    bot_id,
    start_date,
    end_date)
    VALUES (
    $1, $2, NOW(), NOW() + INTERVAL '1 hour')
    RETURNING *`;

    const values = [session_key, bot_id];
    const { rows } = await db.query(query, values)
    return rows[0];
};

const getSessionBySessionkey = async (session_key) => {
    const query = `
    SELECT * FROM sessions
    WHERE session_key = $1`;

    const values = [session_key];
    const { rows } = await db.query(query, values);
    return rows[0];

}


module.exports = {
    insertSession,
    getSessionBySessionkey,
}