const jwt = require('jsonwebtoken')
const secret = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret'

function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    console.log(decoded)
    req.jwtPayload = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      message: 'Not authenticated'
    })
  }
}

module.exports = authenticate