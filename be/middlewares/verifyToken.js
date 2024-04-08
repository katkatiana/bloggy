/********************************** Import section ***************************************************/
const jwt = require('jsonwebtoken');

/**
 * This middleware chack if the authentication key is present, so the user is authorised to make any kind of protected request. 
 * @param {*} req takes token key if present.
 * @param {*} next allows to process any server request if no error occurred.
 * @returns status 401 if no token key is found.
 * @returns status 403 if no token is not valid or expired.
 */
const verifyToken = (req, res, next) => {

    const token = req.headers['authorization'];
    
    if(!token) {
        return res
                .status(401)
                .send(
                    {
                        statusCode: 401,
                        message: 'Unauthorized token'
                    }
                )
    }

    try{
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;

        next()
    } catch(e) {
        res
          .status(403)
          .send(
            {
                statusCode: 403,
                message: 'Forbidden'
            }
          )
    }
}

module.exports = verifyToken;