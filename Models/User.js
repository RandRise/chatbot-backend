const { query } = require('../db');

const createUser = async (firstname, lastname, email, password) => {
    const result = await query(
        'INSERT into users (firstname, lastname, email, password) values($1, $2, $3, $4) RETURNING *',
        [firstname, lastname, email, password]
    );
    return result.rows[0];
};

const getUserByEmail = async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};


const updateUserVerificationCode = async (email, verificationCode) => {
    await query('UPDATE users SET verification_code = $1 WHERE email = $2', [verificationCode, email]);
};

const updateUserPassword = async (email, hashedPassword) => {
    await query('UPDATE users SET password = $1, verification_code = NULL WHERE email = $2', [hashedPassword, email]);
};


module.exports = {
    createUser,
    getUserByEmail,
    updateUserVerificationCode,
    updateUserPassword,
    
};
