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
            folder: 'blogImg',
            allowed_formats: ['png', 'jpeg', 'jpg'],
            public_id: (req, file) => file.name
        }
    }
)

const upload = multer( { storage: internalStorage } );
const cloudUpload = multer({ storage: cloudStorage });

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

server.get('/blogPosts/ByName/:query', async (req, res) => {
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

 
server.patch('/updateBlogPost/:id', async (req, res) => {
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

server.delete('/deleteBlogPost/:id', async (req, res) => {
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
                        message: 'This post was not found'
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
                        message: 'This post was not found'
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

server.delete('/blogPosts/:id/comment/:commentId', async (req, res) => {
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