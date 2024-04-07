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

let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Bloggy',
        link: 'http://localhost:3000'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

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
const cloudUpload = multer({ storage: cloudStorage });


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


router.post('/createUser', cloudUpload.single('avatar'), validateUserBody, async (req, res) => {
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