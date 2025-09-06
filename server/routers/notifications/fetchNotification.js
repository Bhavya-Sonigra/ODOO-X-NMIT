const express = require('express');
const router = express.Router();
const UserNotification = require('../../Models/notifications');

router.get('/get-notifications/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const userNotifications = await UserNotification.findOne({ currentId: userId });
      if (!userNotifications) {
        return res.status(200).json([]); // Return empty array instead of 404
      }
  
      res.status(200).json(userNotifications.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  module.exports = router;