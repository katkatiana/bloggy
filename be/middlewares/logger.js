const loggerMiddleWare = (req, res, next) => {
 const { url, ip, method } = req;

 console.log(`${new Date().toISOString()} request ${method} to endpoint ${url} from ip ${ip}`)

 next()
}

module.exports = loggerMiddleWare;