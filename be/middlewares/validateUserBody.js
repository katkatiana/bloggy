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
        console.log(password)
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

