const express = require('express')
require('dotenv').config({ path: "./.env" });

//PORT
const PORT = process.env.PORT || 3000;

const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));


// Models imports
const User = require('./models/User');
const FoodStall = require('./models/FoodStall');

//Routers Imports
const userRoutes = require('./routes/userRoutes');
const foodStallRoutes = require('./routes/foodStallRoutes');

//Use the routers
app.use('/user', userRoutes);
app.use('/food-stall', foodStallRoutes);

//Server running at
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
