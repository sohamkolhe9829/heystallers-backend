const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    profileURL: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    savedStalls: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodStall' },],
    },
    resetToken: String,
    resetExpires: Date,
});

userSchema.pre('save', async function (next) {
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) return next();
    try {
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);

        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetToken = resetToken;
    this.resetExpires = Date.now() + 3600000; // Token expires in 1 hour
};

module.exports = mongoose.model('User', userSchema);