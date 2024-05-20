const express = require('express');


const User = require('../models/User');
// const Image = require('../models/Image')

var path = require('path')
var fs = require('fs');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// // POST route to add profile picture in Base64
// var multer = require('multer');

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });

// var upload = multer({ storage: storage });

// router.post('/upload-profile', upload.single('image'), async (req, res, next) => {
//     try {
//         var obj = {
//             name: req.body.name,
//             desc: req.body.desc,
//             img: {
//                 data: fs.readFileSync(path.join('uploads/' + req.file.filename)).toString('base64'),
//                 contentType: 'image/png'
//             }
//         }
//         const newImage = new Image(obj);

//         // Save the new user to the database
//         const response = await newImage.save();
//         res.status(201).json({ "imageURL": obj.img.data.toString('base64') });

//     } catch (error) {

//         console.log(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Email already exists' });
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            uid: response.uid
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find the user by email
        const user = await User.findOne({ email: email });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Email or Password' });
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // resturn token as response
        res.status(200).json({
            "user": {
                "_id": user._id,
                "user_type": user.user_type,
                "name": user.name,
                "email": user.email,
                "phone_number": user.phone_number,
                "profile_picture": user.profile_picture
            }, token
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
        console.log(user)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;