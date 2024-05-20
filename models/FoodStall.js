const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const FoodStallSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true
    },
    foodType: {
        type: String,
        enum: ["Veg", "Non-Veg", "Veg & Non-Veg"],
        required: true
    },
    bannerURL: {
        type: String
    },
    pincode: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"] // Ensure GeoJSON Point format
        },
        coordinates: [
            { type: Number, required: true }, // longitude
            { type: Number, required: true }  // latitude
        ]
    },
    openingHours: {
        type: String,
        required: true
    },
    priceRange: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    website: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    images: {
        type: [String]
    },
    menu: {
        type: [String]
    },
    reviewsCount: {
        type: String,
        default: 0
    },
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            foodStallId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FoodStall',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            writtenReview: {
                type: String,
                trim: true,
                maxlength: 1000 // Adjust maxlength as needed
            },
            dateTime: {
                type: Date,
                default: Date.now
            },
            password: {
                type: String,
            }
        }
    ]
});


FoodStallSchema.pre('save', async function (next) {
    const foodStall = this;

    // Hash the password only if it has been modified (or is new)
    if (!foodStall.isModified('password')) return next();
    try {
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(foodStall.password, salt);

        // Override the plain password with the hashed one
        foodStall.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
})

FoodStallSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

module.exports = mongoose.model('FoodStall', FoodStallSchema);