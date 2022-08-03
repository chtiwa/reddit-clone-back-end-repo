const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 20,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please Provide An Email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    // chekced in the input
    minlength: 6
  },
  image: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    deafult: []
    // search engine by users tags
  }
})

UserSchema.pre('save', async function (next) {
  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password, salt)
  next()
})

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id, name: this.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcryptjs.compare(candidatePassword, this.password)
  return isMatch
}

UserSchema.methods.resetPasswordJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_PSW_RESET_LIFETIME })
}

// UserSchema.methods.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex")

//   // this.resetPasswordToken = crypto.createHash("sha256").update(reetToken).digest("hex")
//   this.resetPasswordToken = resetToken
//   this.resetPasswordExpire = Date.now() + (10000 * 60 * 60 * 24)
//   return resetToken
// }

module.exports = mongoose.model('User', UserSchema) 