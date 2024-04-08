/**
 * @fileoverview users.js
 * Defines the mongoose schema for a user to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            max: 255
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        pswHash: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: String,
            required: true
        }
    }, 
    {
        timestamps: true, 
        strict: true
    }
)

module.exports = mongoose.model('userModel', UserSchema, 'users')