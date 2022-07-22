const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, 'Please provide a title']
  },
  creator: {
    type: String,
    required: [true, 'Please provide the creator']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  image: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: [String],
    deafult: []
  },
  comments: {
    type: [{ comment: String, creatorImage: String }],
    deafult: []
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)