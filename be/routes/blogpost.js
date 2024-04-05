const express = require('express');
const server = express.Router();
const BlogPostModel = require('../models/blogpost');
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken')


const internalStorage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'uploads')
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-'+ Math.round(Math.random() * P19);
            const fileExtension = file.originalname.split('.').pop()
            cb(null, `${file.fieldname} + ${uniqueSuffix}.${fileExtension}`)
        }
    }
)

const upload = multer( { storage: internalStorage } );

server.post('/blogPosts/uploadiImg', upload.single('uploadImg'), async (req, res) => {
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
    console.log(query)
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
            console.log(blogPosts)

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

server.get('/blogPosts/:id', async (req, res) => {
    const { id } = req.params;

    try{
        const blogPost = await BlogPostModel.findById(id);
        console.log(blogPost)

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
    console.log(req)

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

server.post('/addBlogPost', async (req, res) => {
    const newBlogPost = new BlogPostModel(
        {
            title: req.body.title,
            cover: req.body.cover,
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



module.exports = server;