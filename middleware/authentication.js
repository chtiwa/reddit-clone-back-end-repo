// const User = require('../models/User')
// const UnauthenticatedError = require('../errors/index')
const UnauthenticatedError = require('../errors')
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: `Unauthorized` })
    // throw new UnauthenticatedError('Unauthorized')
  }

  // tokenLength
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: payload.userId, name: payload.name }
    // console.log('passed by auth')
    next()
  } catch (error) {
    // res.status(500).json({ message: error.message })
    throw new UnauthenticatedError('Authentication invalid')
  }
}

module.exports = auth