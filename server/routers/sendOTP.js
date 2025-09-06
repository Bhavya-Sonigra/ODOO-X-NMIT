const emailService = require('../services/gmailService');

const sendOTP = (userName, userEmail, otp) => {
    return emailService.sendOTP(userName, userEmail, otp);
};

module.exports = { sendOTP };
