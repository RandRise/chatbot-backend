const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { getUserByEmail, createUser, updateUserVerificationCode, updateUserPassword } = require('../Models/User');
const { placeFreeOrder } = require('./Order')

const generateNumericCode = (length) => {

    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
};

const registerUser = async (firstname, lastname, email, hashedPassword, domain) => {
    try {

        const user = await createUser(firstname, lastname, email, hashedPassword);
        if (user != null) {
            console.log("User", user)
            await placeFreeOrder(user.id, domain);
        }
        return user;

    } catch (error) {

        console.error(error);
        throw new Error('Server error');
    }
};

const loginUser = async (userid) => {

    try {

        const token = jwt.sign({ id: userid }, process.env.JWT_SECRET, { expiresIn: '1y' });
        return (token);

    } catch (error) {

        console.error(error);
        throw 'Server error';
    }
};

const sendResetCode = async (email) => {

    const user = await getUserByEmail(email);
    if (!user) {

        throw new Error('User not found');
    }

    const resetCode = generateNumericCode(6);
    await updateUserVerificationCode(email, resetCode);

    const transporter = nodemailer.createTransport({
        host: "smtp.strato.de",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {

        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);
    return { message: 'Reset code sent to email' };
};

const verifyResetCodeAndChangePassword = async (email, resetCode, newPassword) => {

    const user = await getUserByEmail(email);
    if (!user || user.verification_code !== resetCode) {

        throw new Error('Invalid reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(email, hashedPassword);
    return { message: 'Password reset successful' };
};

module.exports = {
    registerUser,
    loginUser,
    sendResetCode,
    verifyResetCodeAndChangePassword,
};