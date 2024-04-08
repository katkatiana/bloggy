/**
 * @fileoverview blogpost.js
 * This route contains all routing methods related to blogposts.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/
const express = require('express');
const server = express.Router();
const BlogPostModel = require('../models/blogpost');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const verifyToken = require('../middlewares/verifyToken');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const crypto = require('crypto');
const { log } = require('console');

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
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

/** Definition of interanl storage to upload images. It defines the destination and generates a random code to identify the image since
 * every file needs to have a unique suffix.
 */
const internalStorage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'uploads')
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-'+ Math.round(Math.random() * 19);
            const fileExtension = file.originalname.split('.').pop()
            cb(null, `${file.fieldname}` + `${uniqueSuffix}.${fileExtension}`)
        }
    }
)

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

/** Definition of Cloudinary folder to generate and of formats taken when uploading files. */
const cloudStorage = new CloudinaryStorage( 
    {
        cloudinary: cloudinary,
        params: {
            folder: 'blogImg',
            allowed_formats: ['png', 'jpeg', 'jpg'],
            public_id: (req, file) => file.name
        }
    }
)

/** Definition of middleware multer for handling the upload process both on cloudinary or internal storage */
const upload = multer( { storage: internalStorage } );
const cloudUpload = multer({ storage: cloudStorage });

/**
 * Route to get add blogpost's images to clodinary storage.
 * @returns status code 200 if POST of the blogpost's image is successful.
 * @returns status code 500 if any other error occurs.
 * @note route need clodinary.single middleware in order to send image to the correct path. If not declared, request will not be submitted correctly.
 */
server.post('/blogPosts/cloudUploadImg', cloudUpload.single('uploadImg'), async (req, res) => {
    try{
        res
            .status(200)
            .json({ source: req.file.path })
    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'File Upload Error'
                }
            )
    }
})

/**
 * Route to get add blogpost's images to internal storage.
 * @returns status code 200 if POST of the blogpost's image is successful.
 * @returns status code 500 if any other error occurs.
 * @note route need upload.single middleware in order to send image to the correct path. If not declared, request will not be submitted correctly.
 */
server.post('/blogPosts/uploadImg', upload.single('uploadImg'), async (req, res) => {
    const url = req.protocol + '://' + req.get('host')

    try{
        const imageUrl = req.file.filename

        res
            .status(200)
            .json(
                {
                    source: `${url}/uploads/${imageUrl}`
                }
            )
    } catch (e) {
        console.log(e)
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'File Upload Error'
                }
            )
    }
})

/**
 * Route to get all blogposts if you are logged id (verifyToken middleware).
 * @returns status code 200 if fetching of the users from db is successful.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.get('/blogPosts', verifyToken, async (req, res) => {
    const query = req.query;
    try{
        let blogPosts 
        if(!query){
            
            /**
             * in this case there is no parameter or query string to search 
             * and so we return all the items in the database
             */ 
            
             blogPosts = await BlogPostModel.find();
        } else {

            /**
             * query string parameters are passed in the following way:
             * ?key1=value1&key2=value2
             * they are returned in req.query in the following obj:
             * { key1: 'value1', key2: 'value2' }
             * in order to search the database for the combination of all parameters (and)
             * we need to generate an obj in the following way:
             * { 
             *   "key1" : { '$regex': '.*value1.*', '$options': 'i' },
             *   "key2" : { '$regex': '.*value2.*', '$options': 'i' }
             * }
             * this obj will be passed to find() to return all the matching items
             * which fulfil all the conditions
             */
            const searchParams = {}
            const searchKeysArray = Object.keys(query);
            searchKeysArray.forEach((key) => {
                searchParams[key] = {
                    $regex: '.*' + query[key] + '.*',
                    $options: 'i'
                }
            })

            blogPosts = await BlogPostModel.find(searchParams)

        }
        res
            .status(200)
            .send(blogPosts)
    } catch(e) {
        console.log(e)
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
 * Route to get all blogposts with specific Id..
 * @returns status code 200 if fetching of the blogposts with requested id from db is successful.
 * @returns status code 404 if the id is not identified.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.get('/blogPosts/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = await BlogPostModel.findById(id);

        if(!blogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'This post was not found'
                    }
                )
        }
        res
            .status(200)
            .send(blogPost)
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
 * Route to get all blogposts with specific name identified by query.
 * @returns status code 200 if fetching of the user with requested id is succesful.
 * @returns status code 404 if the name is not identified.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.get('/blogPosts/ByName/:query', verifyToken, async (req, res) => {
    const { query } = req.params;
 
    try{
        const author = await BlogPostModel.find(
            { 'author.name' : 
                 {
                        $regex: '.*' + query + '.*',
                        $options: 'i'
                    }
            }
        )
        if(!author){
            res
                .status(404)
                .send(
                    {
                        statusCode: 500,
                        message: 'Internal Server Error'
                    }
                )
        }
        res
            .status(200)
            .send(author)

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

/* server.get('/blogPosts?title=:query', async (req, res) => {
    const { query } = req.params;

    try{
        const titleBlogPost = await BlogPostModel.find(
            {
                'title' : {
                    $regex: '.*' + query + '.*',
                    $options: 'i'
                }
            }
        )

        if(!titleBlogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: `This title : ${titleBlogPost} was not found`
                    }
                )
        }
        res
            .status(200)
            .send(titleBlogPost)

    } catch(e) {

    }
}) */

/**
 * Route to add a new blogpost to db if the user is loggeed in (verifyToken middleware).
 * It also sends an email (sent through nodemailer and structured with MailGen library) if the blog post is succesfully added.
 * @returns status code 201 if POST of blogpost is succesful and, only if so, it sends the email.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.post('/addBlogPost', cloudUpload.single('cover'), async (req, res) => {
    
    const email = {
        body: {
            name: req.body.author.name,
            intro: 'Congratulation, your post has been published!',
            action: {
                instructions: 'Want to see it? Please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'View post',
                    link: 'http://localhost:3000/home'
                }
            },
            outro: 'Need help, or have questions? Just send an email to info@bloggy.com, we\'d love to help.'
        }
    };

    let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to:  req.body.author.email,
        subject: 'Your post was added to Bloggy!',
        html: mailGenerator.generate(email),
        text: mailGenerator.generatePlaintext(email)
    };

    const newBlogPost = new BlogPostModel(
        {
            title: req.body.title,
            cover: req.file.path,
            readTime: {
                value: Number(req.body.readTime.value),
                unit: req.body.readTime.unit
            },
            author: {
                name: req.body.author.name
            },
            content: req.body.content
        }
    )

    try{
        const blogPostToSave = await newBlogPost.save();

        res
            .status(201)
            .send(
                {
                    statusCode: 201,
                    payload: blogPostToSave
                }
            )
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
    } catch(e) {
        console.log(e)
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
 * Route to modify an existing blogpost found by id (passed as param).
 * @returns status code 200 if PATCH of the blogpost is succesful.
 * @returns status code 404 if the id blogpost is not found in db.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.patch('/updateBlogPost/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = BlogPostModel.findById(id);

         if(!blogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'This post was not found'
                    }
                )
        }
        const updatedData = req.body;
        const options = { new : true}

        const result = await BlogPostModel.findByIdAndUpdate(id, updatedData, options);

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
 * Route to delete an existing blogpost found by id (passed as param).
 * @returns status code 200 if the blogpost is succesfully deleted from db.
 * @returns status code 404 if the id blogpost is not found in db.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.delete('/deleteBlogPost/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = await BlogPostModel.findByIdAndDelete(id)

        if(!blogPost) {
            res
                .status(404)
                .send('The post was not found')
        }
        res
            .status(200)
            .send(
                {
                    statusCode: 200,
                    message: `Post with id ${id} succesfully deleted`
                }
            )
    } catch(e) {
        res
            .status(500)
            .send({
                statusCode: 500,
                message: 'Internal Server Error'
            })
    }
})

/**
 * Route to modify a cover of existing blogpost found by id (passed as param).
 * @returns status code 200 if PATCH of the blogpost cover is succesful.
 * @returns status code 404 if the id blogpost is not found in db.
 * @returns status code 500 if any other error occurs.
 */
server.patch('/updateBlogPost/:id/cover', cloudUpload.single('cover'), async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = BlogPostModel.findById(id);

         if(!blogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'This post was not found'
                    }
                )
        }
        const updatedData = {cover: req.file.path};
        const options = { new : true }

        const result = await BlogPostModel.findByIdAndUpdate(id, updatedData, options);

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
 * Route to get all blogposts' comment if you are logged id (verifyToken middleware) gotten through blogpost id (passes as param).
 * @returns status code 200 if fetching of the blogposts' comment from db is successful.
 * @returns status code 404 if the blogpost with specified id is not found in db.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.get('/blogPosts/:id/comments', verifyToken, async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = await BlogPostModel.findById(id);

        if(!blogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'This post was not found.'
                    }
                )
        }

    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send({
                statusCode: 500,
                message: 'Internal Server Error'
            })
    }
})

/**
 * Route to add a new comment to an existing blogpost identified by blogpost id if you are logged id (verifyToken middleware).
 * @returns status code 200 if POST of the blogposts' comment is successful.
 * @returns status code 404 if the blogpost with specified id is not found in db.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.post('/blogPosts/:id/addComment', verifyToken, async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = await BlogPostModel.findById(id);

        if(!blogPost) {
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'This post was not found.'
                    }
                )
        } else {
            let newComment = {
                commentId: crypto.randomBytes(12).toString('hex'),
                commentAuthorName: req.body.commentAuthorName,
                commentAuthorAvatar: req.body.commentAuthorAvatar,
                content: req.body.content
            }     

            
            blogPost.comments.push(newComment);            
            await blogPost.save();
            
            res
            .status(200)
            .send({
                statusCode: 200,
                message: 'Comment added successfully.'
            })
            
        }

    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send({
                statusCode: 500,
                message: 'Internal Server Error'
            })
    }
})

/**
 * Route to delete an existing comment idientified by its own id and related to an existing blogpost identified by blogpost id, only if logged in ( verifyToken middleware).
 * @returns status code 200 if delete of the blogposts' comment is successful.
 * @returns status code 404 if the blogpost with specified id is not found in db.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
 */
server.delete('/blogPosts/:id/comment/:commentId', verifyToken, async (req, res) => {
    const id  = req.params.id;
    const commentId = req.params.commentId;

    try{
        const blogPost = await BlogPostModel.findById(id)
        let index;

        if(!blogPost) {
            res
                .status(404)
                .send('The post was not found')
        } else {
            blogPost.comments.map(singleComment => {
                if(singleComment.commentId === commentId){
                    index = blogPost.comments.indexOf(singleComment);
                    blogPost.comments.splice(index, 1);
                }
            })
            await blogPost.save()
            res
            .status(200)
            .send(
                {
                    statusCode: 200,
                    message: `Post with id ${id} succesfully deleted`
                }
            )
        }
    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send({
                statusCode: 500,
                message: 'Internal Server Error'
            })
    }
})

module.exports = server;