/**
 * @fileoverview validateUserBody.js
 * This middleware is responsible of validating the body of HTTP request containing user data.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */


/********************************** Function section *************************************************/

/**
 * validateUserBody
 * This middleware controls every param of the user body object contained in the request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. Is sent with error 400 in case any error occured.
 * @param {*} next allows to advance to the next middleware, but only if no error occured before.
 */
const validateUserBody = (req, res, next) => {
    const errors = [];

    const {
        firstName,
        lastName,
        email,
        password,
        avatar, 
        dateOfBirth,
    } = req.body

    if(typeof firstName !== 'string'){
        errors.push('First name must be a string')
    }
    
    if(typeof lastName !== 'string'){
        errors.push('Last name must be a string')
    }
    
    if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/).test(email)) {
        errors.push('Email is not valid.')
    }
    
    if(typeof password !== 'string' || password.length < 8) {
        errors.push('password must contain at least 8 characters')
    }
    
    if(typeof dateOfBirth !== 'string'){
        errors.push('Date must be a string')
    }
    
    if(errors.length > 0) {
        res
            .status(400)
            .send(
                {
                    statusCode: 400,
                    errors
                }
            )
    } else {
        next()
    }
}

module.exports = validateUserBody;

