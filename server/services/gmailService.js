const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendOTP(userName, userEmail, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Email Verification - EX2NEXT',
            html: this.getOTPTemplate(userName, otp, 'Email Verification', 'Thank you for signing up! Please use the following OTP to verify your email.')
        };

        return this.sendMail(mailOptions);
    }

    async sendResetPasswordOTP(userEmail, otp) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Password Reset - EX2NEXT',
            html: this.getOTPTemplate('User', otp, 'Password Reset Verification', 'You have requested to reset your password. Please use the following OTP to verify your identity.')
        };

        return this.sendMail(mailOptions);
    }

    async sendCallbackRequest(userEmail, sellerName, buyerName, productTitle) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Callback Request - EX2NEXT',
            html: this.getCallbackTemplate(sellerName, buyerName, productTitle)
        };

        return this.sendMail(mailOptions);
    }

    async sendMail(mailOptions) {
        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId, message: 'Email sent successfully' };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message, message: 'Failed to send email' };
        }
    }

    getOTPTemplate(userName, otp, title, description) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
      body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }
      .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
      }
      .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 20px;
          text-align: center;
      }
      .header h1 {
          margin: 0;
          font-size: 24px;
      }
      .content {
          padding: 20px;
          text-align: center;
      }
      .content p {
          font-size: 18px;
          color: #333333;
          line-height: 1.6;
      }
      .otp {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 4px;
          background-color: #f9f9f9;
          padding: 10px 20px;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
      }
      .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #777777;
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="header">
          <h1>${title}</h1>
      </div>
      <div class="content">
          <p>Hello ${userName},</p>
          <p>${description}</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for only 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div class="footer">
          <p>If you didn't request this, please ignore this email or contact support.</p>
          <p>&copy; 2024 EX2NEXT Resale Marketplace. All rights reserved.</p>
      </div>
  </div>
</body>
</html>`;
    }

    getCallbackTemplate(sellerName, buyerName, productTitle) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Callback Request</title>
  <style>
      body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
      }
      .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
      }
      .header {
          background-color: #28a745;
          color: #ffffff;
          padding: 20px;
          text-align: center;
      }
      .header h1 {
          margin: 0;
          font-size: 24px;
      }
      .content {
          padding: 20px;
      }
      .content p {
          font-size: 16px;
          color: #333333;
          line-height: 1.6;
      }
      .product-info {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
      }
      .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #777777;
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="header">
          <h1>Callback Request</h1>
      </div>
      <div class="content">
          <p>Hello ${sellerName},</p>
          <p>You have received a callback request from ${buyerName} for your product listing.</p>
          <div class="product-info">
              <strong>Product:</strong> ${productTitle}
          </div>
          <p>The buyer is interested in your product and would like you to contact them back. Please reach out to them as soon as possible.</p>
          <p>Thank you for using EX2NEXT!</p>
      </div>
      <div class="footer">
          <p>&copy; 2024 EX2NEXT Resale Marketplace. All rights reserved.</p>
      </div>
  </div>
</body>
</html>`;
    }
}

module.exports = new EmailService();
