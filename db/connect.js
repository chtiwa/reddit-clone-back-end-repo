const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, {
    // newUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log(`CONNECTED TO THE DATABASE`))
    .catch((err) => console.log(err))
}

module.exports = connectDB