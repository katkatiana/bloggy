const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const token = req.headers['authorization'];
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