const mongoose = require('mongoose')

require('dotenv').config({ path: "./.env" });

//Mongo db URL
// const mongoURL = 'mongodb://localhost:27017/hotels'
const mongoURL = process.env.DB_URL_LOCAL;

// const mongoURL = process.env.DB_URL;


//setting connection to mongo db
mongoose.connect(mongoURL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})

const db = mongoose.connection;


//listerns
db.on('connected', () => {
    console.log('Connected to MongoDB server');
})
db.on('error', (err) => {
    console.log('Error to connect MongoDB server ', err);
})



module.exports = db;