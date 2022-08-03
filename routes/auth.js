const express = require('express')
const router = express.Router()
const { login, signin, logout, checkLogin, resetPassword, forgotPassword } = require('../controllers/auth')
const multer = require('../utils/multerUser')

// /auth
router.route('/login').post(login)
router.route('/signin').post(multer.single('file'), signin)
router.route('/logout').get(logout)
router.route('/checklogin').get(checkLogin)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetpassword/:resetToken').patch(resetPassword)


module.exports = router