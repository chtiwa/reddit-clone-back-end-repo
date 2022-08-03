require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const connectDB = require('./db/connect')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const errorHandler = require('./middleware/error-handler')

app.use(cors({ origin: [`http://localhost:3000`], credentials: true }))
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(fileupload())
app.use('/posts', postsRoutes)
app.use('/auth', authRoutes)

// error handle ==> last middleware
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