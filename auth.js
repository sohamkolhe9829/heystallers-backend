
//Auth imports
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Person = require('./models/Person');
const FoodStall = require('./models/FoodStall');

//Auth function
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // console.log('reveived credential:', username, password);
        const user = await Person.findOne({ username: username });
        if (!user)
            return done(null, false, { error: 'Username not found.' });

        const isPasswordMatch = await user.comparePassword(password);
        if (isPasswordMatch) {
            return done(null, user);
        } else {
            return done(null, false, { error: 'Incorrect password.' });

        }

    } catch (error) {
        console.log(error)
        done(error);
    }
}))

//Auth function
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // console.log('reveived credential:', username, password);
        const user = await FoodStall.findOne({ username: username });
        if (!user)
            return done(null, false, { error: 'Username not found.' });

        const isPasswordMatch = await user.comparePassword(password);
        if (isPasswordMatch) {
            return done(null, user);
        } else {
            return done(null, false, { error: 'Incorrect password.' });

        }

    } catch (error) {
        console.log(error)
        done(error);
    }
}))

module.exports = passport;