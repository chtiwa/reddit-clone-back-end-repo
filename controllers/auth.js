const User = require('../models/User')
const jwt = require('jsonwebtoken')

const signin = async (req, res) => {
  try {
    const user = await User.create({ ...req.body })
    // console.log(user.image)
    const token = user.createJWT()
    // store the user image in the localStorage 
    res.status(201)
      .cookie("token", token, { httpOnly: true })
      .json({ user: { name: user.name, userId: user.userId, image: user.image }, token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: `Please provide an email and a password` })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: `User was not found` })
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: `Something went wrong try again later` })
    }

    const token = user.createJWT()
    // store the user image in the localStorage 
    res.status(200)
      .cookie("token", token, { httpOnly: true })
      .json({ user: { name: user.name, userId: user.userId, image: user.image } })
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

module.exports = {
  login, signin, checkLogin, logout
}