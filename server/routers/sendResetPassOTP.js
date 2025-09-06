const emailService = require('../services/gmailService');

const sendResetPassOTP = (userEmail, otp) => {
    return emailService.sendResetPasswordOTP(userEmail, otp);
};

module.exports = { sendResetPassOTP };
