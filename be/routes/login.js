const express = require('express');
const server = express.Router();
const UserModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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