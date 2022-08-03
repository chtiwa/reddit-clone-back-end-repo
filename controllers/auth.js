const User = require('../models/User')
const jwt = require('jsonwebtoken')
// const crypto = require('crypto')
const CustomAPIError = require('../errors/custom-api')
const sendEmail = require('../utils/sendEmail')
const cloudinary = require('../utils/cloudinary')

const signin = async (req, res) => {
  try {
    const options = {
      folder: "home/reddit-clone",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    }
    let result
    if (req?.file?.path) {
      result = await cloudinary.uploader.upload(req.file.path, options)
    }
    let image = result?.secure_url || ''
    const user = await User.create({ ...req.body, image: image })
    const token = user.createJWT()
    const expires = new Date(Date.now() + 86400 * 10000) // 10 days
    res.status(201)
      .cookie("token", token, { httpOnly: true, expires: expires })
      .json({ user: { name: user.name, userId: user._id, image: user.image }, token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // console.log(req.body)
    if (!email || !password) {
      return res.status(400).json({ message: `Please provide an email and a password` })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: `Email doesn't exist!` })
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: `Something went wrong try again later!` })
    }

    const token = user.createJWT()
    // store the user image in the localStorage 
    const expires = new Date(Date.now() + 86400 * 10000) // 10 days
    res.status(200)
      .cookie("token", token, { httpOnly: true, expires: expires })
      .json({ user: { name: user.name, userId: user._id, image: user.image } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const logout = async (req, res) => {
  try {
    res.status(201)
      .cookie("token", "", { httpOnly: true, expires: new Date(0) })
      .json({ message: 'Log out successful' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const checkLogin = async (req, res) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.send(false)
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById({ _id: payload.userId })
    // store the user image in the localStorage 
    res.status(200).json({ isLoggedIn: true, name: payload.name, userId: payload.userId, image: user.image })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const forgotPassword = async (req, res, next) => {
  // send a url with the token as a param
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      // return next(new CustomAPIError(`Email doesn't exist!`, 404))
      return res.status(404).json({ success: false, message: `Email doesn't exist!` })
    }
    const pswjwt = user.resetPasswordJWT()
    const resultUrl = `http://localhost:3000/resetpassword/${pswjwt}`

    const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password</p>
    <a href=${resultUrl} clicktracking=off>
    ${resultUrl}
    </a>`
    try {
      sendEmail({
        to: user.email,
        text: message
      })
      res.status(200).json({ success: true, message: `Email was sent successfuly` })
    } catch (error) {
      res.status(400).json({ success: false, message: `Email couldn't be sent` })
    }
  }
  catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res, next) => {
  // send the request with the token as a param and the new password
  try {
    const pswjwt = req.params?.resetToken
    const payload = jwt.verify(pswjwt, process.env.JWT_SECRET)
    if (!payload) {
      // from the front end => error.response.data.message
      return res.status(400).json({ success: false, message: 'Token was expired' })
    }
    const user = await User.findById({ _id: payload.userId })

    // if (!user) {
    //   // return next(new CustomAPIError('Invalid reset token', 400))
    //   return res.status(400).json({ success: false, message: 'Token was expired' })
    // }

    user.password = req.body.password
    await user.save()

    res.status(201).json({ success: true, message: "Password reset was successful" })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token was expired, Try again!' })
  }
}

module.exports = {
  login, signin, checkLogin, logout, resetPassword, forgotPassword
}