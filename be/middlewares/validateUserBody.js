/**
 * This middleware controls every param  of the user body object and allows to specify what kind of characteristics they need to have in order to process any request.
 * @param {*} req takes the user body to be validated.
 * @param {*} res sends error 400 in case any error occured.
 * @param {*} next allows to process the server request only if no error occured before.
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
    
    if(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/.test(email)){
        errors.push('Please insert a valid email')
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

