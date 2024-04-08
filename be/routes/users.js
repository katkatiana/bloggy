/**
 * @fileoverview users.js
 * This route contains all routing methods related to users.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserModel = require('../models/users');
const validateUserBody = require('../middlewares/validateUserBody');
const verifyToken = require('../middlewares/verifyToken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

/** Set the transporter (object) able to send an email with nodemailer library */
let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

/** Set the responsive HTML emails with Mailgen library */
let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Bloggy',
        link: 'http://localhost:3000'
    }
});

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

/** Definition of Cloudinary folder to generate and of formats taken when uploading files.  */
const cloudStorage = new CloudinaryStorage( 
    {
        cloudinary: cloudinary,
        params: {
            folder: 'userImg',
            allowed_formats: ['png', 'jpeg', 'jpg'],
            public_id: (req, file) => file.name
        }
    }
)

/** Definition of middleware multer for handling the upload process */
const cloudUpload = multer({ storage: cloudStorage });

/**
 * Route to get all users if you are logged id (verifyToken middleware).
 * @returns status code 200 if fetching of the users from db is successful.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
router.get('/getUsers', verifyToken, async (req, res) => {
    try {
        const users = await UserModel.find();
        res
            .status(200)
            .send(users)
    } catch (e){
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )
    }
})

/**
 * Route to get all users with specific Id.
 * @returns status code 200 if fetching of the user with requested id is succesful.
 * @returns status code 404 if the id is not identified.
 * @returns status code 500 if any other error occurs.
 */
router.get('/getUsers/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const userExist = await UserModel.findById(id);
    
        if(!userExist) {
            return res 
                    .status(404)
                    .send(
                        {
                            statusCode: 404,
                            message: 'The requested user does not exist'
                        }
                    )
        }

        res
            .status(200)
            .send(userExist)
    } catch (e) {
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )

    }
})

/**
 * Route to get all users with specific name identified by query.
 * @returns status code 200 if fetching of the user with requested id is found in db.
 * @returns status code 404 if the id is not identified.
 * @returns status code 500 if any other error occurs.
 */
router.get("/getUsers/ByName/:query", async (req, res) => {
    const {query} = req.params;

    try{
        const user = await UserModel.find({
            firstName: {
                //operatori di mongoose (anche es. gte(greater than), lte(lower than)....)
                $regex: '.*' + query + '.*',
                //to make search case insensitive with the regular expressions (https://www.mongodb.com/docs/manual/reference/operator/query/regex/)
                $options: 'i'
            }
        })
        if(!user) {
            return res  
                    .status(404)
                    .send({
                        statusCode: 404,
                        message: 'User not found'
                    })
        }
        res
            .status(200)
            .send(user)
    } catch(e) {
        res
        .status(500)
        .send(
            {
                statusCode: 500,
                message: 'Internal Server Error'
            }
        )
    }
})

/**
 * Route to create a new user if the body of the request is valid (validateUserBody middleware).
 * It also sends an email (sent through nodemailer and structured with MailGen library) if the signup is succesful.
 * @returns status code 201 if POST of the user is succesful and, only if so, it sends the email.
 * @returns status code 409 if the user already exists.
 * @returns status code 500 if any other error occurs.
 * @note route has a specific middleware ablo to check if any data of the user body is uncorrect or empty. If so, no user will be added in db.
 */
router.post('/createUser', cloudUpload.single('avatar'), validateUserBody, async (req, res) => {
    
    /******** Internal Variables  ***************************************************/
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = req.body.firstName + " " + req.body.lastName;
    const userEmail = req.body.email;
    const email = {
        body: {
            name: user,
            intro: 'Welcome to Bloggy! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just send an email to info@bloggy.com, we\'d love to help.'
        }
    };

    let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: req.body.email,
        subject: 'Welcome to Bloggy',
        html: mailGenerator.generate(email),
        text: mailGenerator.generatePlaintext(email)
    };

    /* TODO: check existence of user */

    try {
        const user = await UserModel.findOne({email: userEmail})
        if(user) {
            res
                .status(409)
                .send(
                    {
                        statusCode: 409,
                        message: 'Conflict. User already exists.'
                    }
                )
        } else {
            const newUser = new UserModel(
                {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: userEmail,
                    pswHash: hashedPassword,
                    avatar : req.file.path,
                    dateOfBirth: req.body.dateOfBirth
                }
            )
        
            const userToSave = await newUser.save();
            res
                .status(201)
                .send(
                    {
                        statusCode: 201,
                        payload: userToSave
                    }
                )
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send (
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )

    }
})

/**
 * Route to modify an existing user found by id (passed as param).
 * @returns status code 200 if PATCH of the user is succesful.
 * @returns status code 404 if the id user is not found in db.
 * @returns status code 500 if any other error occurs.
 */
router.patch("/updateUser/:id", async (req, res) => {
    const {id} = req.params;

    try{
        const user = await UserModel.findById(id);

        if(!user) {
            return res
                    .status(404)
                    .send({
                        statusCode: 404,
                        message: 'User not found'
                    })
        }

        const updatedData = req.body;
        const options = { new : true}

        const result = await UserModel.findByIdAndUpdate(id, updatedData, options);

        res
            .status(200)
            .send(result)
    } catch(e) {
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )
    }
})

/**
 * Route to delete an existing user found by id (passed as param).
 * @returns status code 200 if the user is succesfully deleted from db.
 * @returns status code 404 if the id user is not found in db.
 * @returns status code 500 if any other error occurs.
 */
router.delete('/deleteUser/:id', async (req, res) => {
    const {id} = req.params;

    try{
        const user = await UserModel.findByIdAndDelete(id)
        if(!user) {
            return res
                    .status(404)
                    .send({
                        statusCode: 404,
                        message: 'User not found'
                    })
        }
        res
            .status(200)
            .send(`User with ${id} successfully removed`)
    } catch(e) {
        res
        .status(500)
        .send(
            {
                statusCode: 500,
                message: 'Internal Server Error'
            }
        )
    }
})


/**
 * Route to modify an avatar of existing user found by id (passed as param).
 * @returns status code 200 if PATCH of the user avatar is succesful.
 * @returns status code 404 if the id user is not found in db.
 * @returns status code 500 if any other error occurs.
 */
router.patch("/updateUser/:id/avatar", cloudUpload.single('avatar'), async (req, res) => {
    const {id} = req.params;

    try{
        const user = await UserModel.findById(id);

        if(!user) {
            return res
                    .status(404)
                    .send({
                        statusCode: 404,
                        message: 'User not found'
                    })
        }

        const updatedData = {avatar: req.file.path};
        const options = { new : true }

        const result = await UserModel.findByIdAndUpdate(id, updatedData, options);

        res
            .status(200)
            .send(result)
    } catch(e) {
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )
    }
})

module.exports = router;