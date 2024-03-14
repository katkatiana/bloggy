const express = require('express');
const router = express.Router();
const UserModel = require('../models/users');

router.get('/getUsers', async (req, res) => {
    try {
        const users = await UserModel.find();
        res
            .status(200)
            .send(users)
    }
    catch (e){
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
    }
    catch(e) {
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


router.post('/createUser', async (req, res) => {
    const newUser = new UserModel(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar : req.body.avatar,
            dateOfBirth: req.body.dateOfBirth
        }
    )

    try {
        const userToSave = await newUser.save();
        res
            .status(201)
            .send(
                {
                    statusCode: 201,
                    payload: userToSave
                }
            )
    }
    catch(e) {
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
    }
    catch(e) {
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
    }
    catch(e) {
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