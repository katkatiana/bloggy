/**
 * @fileoverview verifyToken.js
 * This middleware is responsible of verifying the access token contained in the incoming HTTP request header.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/********************************** Import section ***************************************************/
const jwt = require('jsonwebtoken');

/********************************** Function section *************************************************/

/**
 * verifyToken
 * This middleware checks if the authentication token is present, and if so,
 * verifies it using jwt library.
 * @param {*} req the incoming HTTP request, whose header contains the authentication token.
 * @param {*} res the outgoing response.
 * @param {*} next allows to advance to the next middleware, if any.
 * @returns status 401 if no token is found.
 * @returns status 403 if token is not valid or expired.
 */
const verifyToken = (req, res, next) => {

    let token = req.headers['authorization'];
    console.log(token)
    
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
        
        /* In case token is not valid, an exception is raised */
        if(token.startsWith("\"") && token.endsWith("\""))
        {
            token = token.substring(1, token.length -1)
        }
        
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;

        next()
    } catch(e) {
        console.log(e)
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