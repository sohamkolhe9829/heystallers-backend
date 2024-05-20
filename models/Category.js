const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    imageURL: {
        type: String,
        validate: {
            validator: (url) => {
                // Optional validation for a valid URL format
                // You can use a URL validation library like validator.js
                // return true/false based on the validation
                return true; // Replace with actual validation logic
            },
            message: (props) => `${props.value} is not a valid image URL!`,
        },
    },
});

module.exports = mongoose.model('Category', categorySchema);