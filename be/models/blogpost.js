/**
 * @fileoverview blogpost.js
 * Defines the mongoose schema for a blog post to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

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
                type: Number,
                default: 3
            },
            unit: {
                type: String,
                default: 'min'
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
        },
        comments: [
            {
                commentId: {
                    type: String,
                    required: true
                },
                commentAuthorName: {
                    type: String,
                    required: true
                },
                commentAuthorAvatar: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true
                }
            }
        ]
    }
)

module.exports = mongoose.model('blogPostModel', BlogPostSchema, 'blogposts')