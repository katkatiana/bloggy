/**
 * @fileoverview login.js
 * This route contains all routing methods related to login.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const server = express.Router();
const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Route to log in if user is already existing in db.
 * @returns status code 200 if POST of the user is succesful, so the user is found in db and a token is generated for its session with duration of 24h.
 * @returns status code 404 if the user does not exist yet.
 * @returns status code 401 if password is not matching with the one stored in db.
 * @returns status code 500 if any other error occurs.
 */
server.post('/login', async (req, res) => {

    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    try{
        const user = await UserModel.findOne(
            {
                email: loginEmail
            }
        )
        if(!user){
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'User not found'
                    }
                )
        } else {
            /** bcrypt library simplifies comparison of hashed password stored in db */
            const verifyPassword = await bcrypt.compare(loginPassword, user.pswHash);

            if(!verifyPassword) {
                res
                    .status(401)
                    .send(
                        {
                            statusCode: 401,
                            message: 'Unauthorized'
                        }
                    )
            } else {
                /** this jwt configuration makes possible to store the specified properties of the logged in user */
                const token = jwt.sign(
                    {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        avatar: user.avatar
                    }, process.env.SECRET_KEY, {
                        expiresIn: '24h'
                    }
                )
                res
                    .header('Authorization', token)
                    .status(200) 
                    .send(
                        {
                            statusCode: 200,
                            message: 'Login successful',
                            token
                        }
                    ) 
                
            }
        
        
        }
    } catch (e) {
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


module.exports = server