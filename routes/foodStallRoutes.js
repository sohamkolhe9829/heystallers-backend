const express = require('express');


const FoodStall = require('../models/FoodStall');
const Review = require('../models/Review')
// const Image = require('../models/Image')

var path = require('path')
var fs = require('fs');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// POST route to add a food Stall
router.post('/signup', async (req, res) => {
    try {
        const data = req.body

        // Check if a foodStall with the same email already exists
        const existingFoodStall = await FoodStall.findOne({ email: data.email });
        if (existingFoodStall) {
            return res.status(400).json({ error: 'Foos Stall with the same Email already exists' });
        }

        // Create a new FoodStall document using the Mongoose model
        const newFoodStall = new FoodStall(data);

        // Save the new foodStall to the database
        const response = await newFoodStall.save();
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

        // Find the foodStall by email
        const foodStall = await FoodStall.findOne({ email: email });

        // If foodStall does not exist or password does not match, return error
        if (!foodStall || !(await foodStall.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Email or Password' });
        }

        // generate Token 
        const payload = {
            id: foodStall.id,
        }
        const token = generateToken(payload);

        // resturn token as response
        res.status(200).json({
            "foodStall": {
                "email": foodStall.email,
                "name": foodStall.name,
                "category": foodStall.category,
                "isApproved": foodStall.isApproved,
                "foodType": foodStall.foodType,
                "bannerURL": foodStall.bannerURL,
                "pincode": foodStall.pincode,
                "location": foodStall.location,
                "coordinates": foodStall.coordinates,
                "openingHours": foodStall.openingHours,
                "priceRange": foodStall.priceRange,
                "phone": foodStall.phone,
                "website": foodStall.website,

                "rating": foodStall.rating,
                "images": foodStall.images,
                "menu": foodStall.menu,
                "reviewsCount": foodStall.reviewsCount,
                "reviews": foodStall.reviews
            }
            , token
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//Update food stall data using food stall id
router.put(':id', jwtAuthMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const uploadReview = req.body;

        const response = await FoodStall.findByIdAndUpdate(personId, updatedPersonData, {
            new: true, //return updated data
            runValidators: true, //run mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Person not found' });
        }

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Get all food stalls
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const foodStalls = await FoodStall.find();

        if (!foodStalls) {
            res.status(200).json({
                statusCode: 200,
                message: "Successfull"
            });
        }

        res.status(200).json(foodStalls);

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });

    }
})


//Get food stall data by food stall id
router.get('/:foodStallId', jwtAuthMiddleware, async (req, res) => {
    try {
        const foodStallId = req.params.foodStallId;
        const foodStall = await FoodStall.findById(foodStallId);
        res.status(200).json({ foodStall });
        console.log(foodStall)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


//Update food stall acount password 
router.put('/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const foodStallId = req.foodStall.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the foodStall by foodStallID
        const foodStall = await FoodStall.findById(foodStallId);

        // If foodStall does not exist or password does not match, return error
        if (!foodStall || !(await foodStall.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Update the foodStall's password
        foodStall.password = newPassword;
        await foodStall.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



//Adding review to food stall
router.post('/add-review', async (req, res) => {
    try {
        const { userId, foodStallId, rating, writtenReview, dateTime } = req.body;


        // Find the food stall by ID
        const foodStall = await FoodStall.findById(foodStallId);

        if (!foodStall) {
            return res.status(404).send('Food stall not found.');
        }

        // Create a new review document
        const newReview = new Review({
            userId,
            foodStallId: foodStallId,
            rating,
            writtenReview,
            dateTime: dateTime
        });

        // Save the review to the database
        await newReview.save();

        // Push the new review to the food stall's reviews array
        foodStall.reviews.push(newReview);
        await foodStall.save();

        res.status(200).json({ response: "Successfull", statusCode: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the review.');
    }
})

module.exports = router;