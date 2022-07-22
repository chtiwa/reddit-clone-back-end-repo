const CustomAPIError = require('./custom-api')

class Unauthenticated extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = 401
  }
}

module.exports = Unauthenticated