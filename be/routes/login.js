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

/******** Function Section  ****************************************************/

/**
 * Route that handles user login.
 * Login is successful only if user is present in the db.
 * Method: POST
 * @returns status code 200 if login of the user is successful: so the user is found in db and a token is generated for its session with duration of 24h.
 * @returns status code 404 if the user does not exist.
 * @returns status code 401 if password or the email is not matching with the ones stored in db.
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
            /** calculates the hash of the received password, then compares this hash with the hash stored in the db */
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
                /** create a new jwt token for the logged user using the user info retrieved from db */
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
                /** send back the token to the frontend in the response */
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