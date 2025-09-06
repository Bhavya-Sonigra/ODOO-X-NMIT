const express = require('express');
const User = require('../Models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salt = 10;
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password, isGoogleLogin } = req.body;
    let user = await User.findOne({ email });
 
    // console.log(isGoogleLogin);
    if (user) {

        // console.log(meetingInfo)
        if (isGoogleLogin) {
            if (user.googleId === '') {
                await User.updateOne({ userId: user.userId },  // Filter criteria
                    { $set: { googleId:await bcrypt.hash(password, salt) } })
            }

            if (user) {
                bcrypt.compare(password, user.googleId, async (err, result) => {

                    if (err) {
                        console.log('Error comparing passwords !!');
                    }
                    else if (result) {
                        const UserInfo = {
                            ...user.toObject(),
                        };
                        delete UserInfo.password;
                        
                        // Generate JWT token
                        const token = jwt.sign(
                            { userId: user._id, email: user.email },
                            process.env.JWT_SECRET || 'your-secret-key-here',
                            { expiresIn: '24h' }
                        );
                        
                        res.status(200).json({
                            msg: 'success',
                            success: true,
                            userData: UserInfo,
                            token: token
                        })
                    }
                    else {
                        res.status(404).json({ msg: 'User not found in record !', success: false })
                    }
                })
            }
        }
        else {
            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    console.log('error comparing passwords !!');
                }
                else if (result) {
                    const UserInfo = {
                        ...user.toObject(),
                    };
                    delete UserInfo.password;
                    
                    // Generate JWT token
                    const token = jwt.sign(
                        { userId: user._id, email: user.email },
                        process.env.JWT_SECRET || 'your-secret-key-here',
                        { expiresIn: '24h' }
                    );
                    
                    res.status(200).json({
                        msg: 'Login Successful',
                        success: true,
                        userData: UserInfo,
                        token: token
                    })
                }
                else {
                    res.status(404).json({ msg: 'Invalid email or password', success: false })
                }
            })
        }


    }
    else{
        res.status(404).json({ msg: 'User not found !', success: false })
    }
})

module.exports = router;