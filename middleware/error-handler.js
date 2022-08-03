const CustomAPIError = require('../errors/custom-api')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.massage
  console.log(err)

  if (err.code === 11000) {
    const message = `Duplicate Field Value Enter`
    err = new CustomAPIError(message, 400)
  }
  if (err.name === `ValidationError`) {
    const message = Object.values(err.message).map((val) => val.message)
    error = new CustomAPIError(message, 400)
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || `Internal Server Error`
  })
}

module.exports = errorHandler

// const errorHandlerMiddleware = (err, req, res, next) => {
//   let customError = {
//     status: err.status || 500,
//     message: err.message || 'Something went wrong, Try again later.'
//   }

//   if (err.name === 'ValidationError') {
//     customError.message = Object.values(err.errors)
//       .map((item) => item.message)
//       .join(',')
//     customError.status = 400
//   }

//   if (err.code === 11000) {
//     customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field,Please choose another value`
//     customError.status = 404
//   }

//   if (err.name === 'CastError') {
//     customError.message = `No item found with the id :${err.value}`
//     customError.status = 404
//   }

//   // return res.status(customError.status).json({ message: customError.message })
//   return customError
// }

// module.exports = errorHandlerMiddleware