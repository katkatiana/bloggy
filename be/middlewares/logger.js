/**
 * @fileoverview logger.js
 * This middleware is responsible of logging HTTP requests made to the backend.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/********************************** Function section *************************************************/

/**
 * loggerMiddleware
 * This middleware logs a string with precise date and time every time a  request made to the server 
 * specifying the method, endpoint and ip to which the request is made.
 * @param {*} req the incoming request
 * @param {*} res the outgoing response (not used)
 * @param {*} next allows to go on after executing the request if no error occurred.
 */
const loggerMiddleWare = (req, res, next) => {
 const { url, ip, method } = req;

 console.log(`${new Date().toISOString()} request ${method} to endpoint ${url} from ip ${ip}`)

 next()
}

module.exports = loggerMiddleWare;