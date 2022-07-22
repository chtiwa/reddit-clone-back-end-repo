const CustomAPIError = require('./custom-api')

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = 500
  }
}

module.exports = BadRequestError