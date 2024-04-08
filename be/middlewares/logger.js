/**
 * This middleware allows to define as a string with precise date and time every kind of request made to the server specifiyng the method, endpoint and ip to which the request is made.
 * @param {*} req takes all the needed params
 * @param {*} next allows to go on after executing the request if no error occurred.
 */
const loggerMiddleWare = (req, res, next) => {
 const { url, ip, method } = req;

 console.log(`${new Date().toISOString()} request ${method} to endpoint ${url} from ip ${ip}`)

 next()
}

module.exports = loggerMiddleWare;