const mongoose = require('mongoose');



const ReviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    foodStallId: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    writtenReview: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    }
});


module.exports = mongoose.model('Review', ReviewSchema);