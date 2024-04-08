/**
 * @fileoverview main.js
 * This document contains all routes and the direct connection to mongoose database.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */
/******** Import Section  *******************************************************/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const logger = require('./middlewares/logger');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

/******** Internal Variables  ***************************************************/

const PORT = 3030;

const app = express();

/******** Import ROUTES Section  *******************************************************/
const usersRoute = require('./routes/users');
const blogPostRoute = require('./routes/blogpost');
const loginRoute = require('./routes/login');
const githubRoute = require('./routes/github');

/******** Middleware Section  *******************************************************/

app.use(express.json());
//we need to define cors before all routes in order to have them working
app.use(cors());

app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, './uploads')))
app.use('/', usersRoute);
app.use('/', blogPostRoute);
app.use('/', loginRoute);
app.use('/', githubRoute);

/** Connection to mongoose */
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database succesfully connected')
})

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)



app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))