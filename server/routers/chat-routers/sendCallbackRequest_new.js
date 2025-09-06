const express = require('express');
const emailService = require('../../services/gmailService');
const router = express.Router();
const { addNotification } = require('../notifications/addNotification');

router.post('/send-call-back-request', async (req, res) => {
    const { buyerName, buyerEmail, buyerPhoneNumber, currentUserId, profile, sellerEmail, sellerUserId } = req.body;

    const newNotification = {
        title: `Contact Request from ${buyerName}`,
        senderName: buyerName,
        email: buyerEmail,
        phone: buyerPhoneNumber,
        profile: profile,
        desc: 'You have received a request to contact the buyer regarding your listing. Please find the buyer details below:',
        senderId: currentUserId,
        isRead: false,
        createDate: new Date(),
    };

    try {
        // Send notification first
        const result = await addNotification(sellerUserId, newNotification);
        if (result.success) {
            res.status(200).json({ message: 'Callback request sent' });
           
            // Send email asynchronously
            setImmediate(async () => {
                try {
                    const mailResult = await emailService.sendCallbackRequest(
                        sellerEmail, 
                        'Seller', // sellerName - you may want to pass this from frontend
                        buyerName, 
                        'Product' // productTitle - you may want to pass this from frontend
                    );
                    if (mailResult.success) {
                        console.log('Email sent successfully');
                    } else {
                        console.error('Error sending email:', mailResult.error);
                    }
                } catch (error) {
                    console.error('Error sending email:', error);
                }
            });
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request', error });
    }
});

module.exports = router;
