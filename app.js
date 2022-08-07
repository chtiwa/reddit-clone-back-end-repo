require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const connectDB = require('./db/connect')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const errorHandler = require('./middleware/error-handler')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// 
app.use(cors({ origin: [`https://reddit-clone-chtiwa-frontend.netlify.app`], credentials: true }))
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
}))
app.use(helmet())
app.use(xss())
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/posts', postsRoutes)
app.use('/api/auth', authRoutes)
app.use(errorHandler)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Server is listening on port ${port}`))
  } catch (error) {
    console.log(error)
  }
}

start()