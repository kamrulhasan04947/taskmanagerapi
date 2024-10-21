const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const router = new express.Router();

// Register a new user
router.post('/users/register', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(200).json({
            status: "ok",
            message: 'registration successful',
            data: user
        }); 
    } catch (e) {
        res.status(400).send(e);
    }
});

// Login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).json({
            status: "ok",
            msg: "Login successful",
            user: user,
            token: token
        })
    } catch (e) {
        res.status(400).send({ error: 'Unable to login' });
    }
});

// Update user
router.patch('/users/update/:userId', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'mobile', 'photo']; // Allowed fields to update
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        // Find user by userId
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).send({ error: 'User not found!' });
        }

        // Update allowed fields
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.json({
            status: "ok",
            msg:"Update Success full",
            data: user
        });
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }
});

// Delete user account
router.delete('/users/delete/:userId', auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ userId: req.params.userId });
        
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.json({
            status: `${user.firstName} is deleted`,
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});



// Log out from all sessions (delete all tokens)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        // Clear the user's tokens array
        req.user.tokens = [];
        await req.user.save(); // Save the updated user
        res.json({
            status: "logout",
            msg: "Logout successfull",
        });
    } catch (e) {
        res.status(500).send({ error: 'Failed to log out from all sessions' });
    }
});

const appPassword = process.env.GOOGLE_APP_PASSWORD 

// Email verification route
router.post('/users/emailVerification', async (req, res) => {
    const { email } = req.body;

    try {
    
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ msg: "Requested user is not found" });
        }

        const otp = await user.generateBase64OTP();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'kamrulhasan4947@gmail.com',
                pass: appPassword
            },
        });

        const emailOptions = {
            from: 'kamrulhasan4947@gmail.com',
            to: user.email,
            subject: "OTP For Email Verification",
            text: `Your OTP is ${otp}`
        };

        // Send email
        await transporter.sendMail(emailOptions);

        res.status(200).json({
            status: "ok",
            otp,
            msg: `A new OTP has been sent to ${user.email}`
        });

    } catch (e) {
        res.status(500).send({ error: 'Failed to send OTP.' });
    }
});


// verifyOTP

router.post('/users/verify-otp', async (req, res)=>{
    const {email , otp} = req.body;

    try{
        const user = await User.findOne({email});
        
        if(!user){
            return res.status(400).send({msg: "User not found"});
        }

        if(user.otp != otp){
            return "Invalid otp";
        }

        if(Date.now > user.otpExpaires){
            return res.status(400).send({msg: `${otp} is expaired`});
        }

        user.isVarified = true;
        user.otp = undefined;
        user.otpExpaires =undefined;
        
        await user.save();

        res.status(200).json({
            status: "ok",
            email: user.email,
            msg: `${user.email} is verified`
        });

    }catch(e){
       res.status(500).send({msg: "OTP is not varified!"})
    }
});



router.patch('/users/resetpasswoard', async (req, res)=>{
            
    const {email, newPassword} = req.body
    try{
        user = await User.findOne({email});

        if(user.isVarified){
            user.password = newPassword;
            user.isVarified = false
            await user.save();
            res.send({msg: 'password is reset successfully'});
        }else{
            res.status(401).send({msg: "user is not verified."})
        }
    }catch(e){
        res.status(500).send({error: e});
    }

});





module.exports = router;
