const express = require('express')
const router = express.Router()
const { login, signin, logout, checkLogin } = require('../controllers/auth')
// const auth = require('../middleware/authentication')

// /auth/

router.route('/login').post(login)
router.route('/signin').post(signin)
router.route('/logout').get(logout)
router.route('/checklogin').get(checkLogin)


module.exports = router