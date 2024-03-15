const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: false
        },
        title: {
            type: String,
            required: true
        },
        cover: {
            type: String,
            required: true
        },
        readTime: {
            value: {
                type: Number
            },
            unit: {
                type: String,
                required: true
            }
        },
        author: {
            name: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                required: false
            }
        },
        content: {
            type: String,
            required: true
        }
    }
)

module.exports = mongoose.model('blogPostModel', BlogPostSchema, 'blogposts')