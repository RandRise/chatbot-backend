const bcrypt = require('bcrypt');
const { registerUser, loginUser, sendResetCode, verifyResetCodeAndChangePassword } = require('../Services/Authentication');
const { getUserByEmail } = require('../Models/User');
const { createResponse } = require('../Utils/responseUtils');

const register = async (req, res) => {

    const { firstname, lastname, email, password } = req.body;

    try {
        const normalizedEmail = email.toLowerCase();

        const existingUser = await getUserByEmail(normalizedEmail);

        if (existingUser) {

            return res.status(500).json(createResponse(500, 'User Already Exists', null, null));
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await registerUser(firstname, lastname, normalizedEmail, hashedPassword);

        const token = await loginUser(user.id)

        return res.status(200).json(createResponse(200, 'User Created Successfully', token, user));
    } catch (error) {

        console.error(error);
        return res.status(500).json(createResponse(500, 'Server Error', error.message, null))
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const normalizedEmail = email.toLowerCase();

        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(500).json(createResponse(500, 'Invalid email or password', null, null));
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(500).json(createResponse(500, 'Invalid email or password', null, null));
        }

        const token = await loginUser(user.id);

        return res.json(createResponse(200, 'Login successful', { token: token, userId: user.id }));
    } catch (error) {

        console.error(error);

        return res.status(500).json(createResponse(500, 'Server error', error.message, null));
    }
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {

        await sendResetCode(email);
        return res.status(200).json(createResponse(200, 'Reset code sent to email', null));

    } catch (error) {

        console.error(error);
        return res.status(500).json(createResponse(500, 'Server error', error.message, null));
    }
};

const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;
    try {

        const response = await verifyResetCodeAndChangePassword(email, resetCode, newPassword);
        return res.status(200).json(createResponse(200, response.message));

    } catch (error) {

        console.error(error);
        return res.status(500).json(createResponse(500, 'Server Error', error.message));
    }
};

module.exports = {
    login,
    register,
    requestPasswordReset,
    resetPassword,
};