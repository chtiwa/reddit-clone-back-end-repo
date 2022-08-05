const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')
// const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors')
const cloudinary = require('../utils/cloudinary')

const getPosts = async (req, res) => {
  // search engine by tags
  // grab the UserSchema 
  // get diffrent users and select the tags that the user has searched for
  try {
    const { page } = req.query
    const LIMIT = 10
    const startIndex = (Number(page) - 1) * LIMIT

    const total = await Post.countDocuments({})

    const posts = await Post.find().sort({ createdAt: 1 }).limit(LIMIT).skip(startIndex)

    // the pages defines when to stop fetching new data
    const pages = Math.ceil(total / LIMIT)
    if (page > pages + 1) {
      return res.status(400).json({ message: `No more posts to be displayed` })
      // return
    }
    res.status(200).json({ posts: posts, pages: pages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSubredditPosts = async (req, res) => {
  try {
    const { page } = req.query
    const { tag } = req.params
    const LIMIT = 10
    const startIndex = (Number(page) - 1) * LIMIT

    let posts = await Post.find({ tags: { $in: tag } })
    if (posts.length === 0 || tag === undefined || tag === '') {
      return res.status(404).json({ message: `No subreddit was found!` })
    }
    const total = posts.length
    const pages = Math.ceil(total / LIMIT)

    if (page > pages + 1) {
      return res.status(404).json({ message: `Page not found!` })
    }
    posts = await Post.find({ tags: { $in: tag } }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)

    res.status(200).json({ posts: posts, pages: pages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPostsBySearch = async (req, res) => {
  // const { searchQuery, tags } = req.query
  const { search } = req.query
  // this would be in the modal so the limit would be ten posts order by id
  // the recommendation system functions here (trending)
  try {
    const posts = await Post.aggregate([
      { $match: { title: search } },
      { $project: { _id: 1, title: 1, file: 1, tags: 1, description: 1 } }
    ])
    if (!posts) {
      return res.status(404).json({ message: `Page not found` })
    }

    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPostsByCreator = async (req, res) => {
  try {
    const { page, creator } = req.query

    let posts
    // to determine how many pages there is
    if (creator === undefined) {
      posts = await Post.find({ createdBy: req.user.userId })
    } else {
      posts = await Post.find({ creator: creator })
    }

    const LIMIT = 10
    const total = posts.length
    const startIndex = (Number(page) - 1) * LIMIT
    const pages = Math.ceil(total / LIMIT)

    if (creator === undefined) {
      posts = await Post.find({ createdBy: req.user.userId }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
    } else {
      posts = await Post.find({ creator: creator }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
    }

    let sameUser = false
    if (req.user.userId === posts[0]?.createdBy.toString()) {
      sameUser = true
      // console.log('same user')
    }
    res.status(200).json({ posts: posts, pages: pages, sameUser: sameUser })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSinglePost = async (req, res) => {
  try {
    const { id, userId } = req.params
    const post = await Post.findById(id)
    let hasLikedPost = false
    if (userId) {
      const index = post.likes.findIndex((id) => id === String(userId))
      if (index !== -1) hasLikedPost = true
    }

    res.status(200).json({ post, hasLikedPost })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// const uploadImage = async (req, res) => {
//   try {
//     // console.log(req.file)
//     const options = {
//       // resource_type: "video",
//       use_filename: true,
//       unique_filename: false,
//       overwrite: true,
//     }
//     const result = await cloudinary.uploader.upload(req.file.path, options)
//     res.status(201).json({ message: result.secure_url })
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

const createPost = async (req, res) => {
  try {
    // console.log('file', req.file)
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(404).json({ message: `User wasn't found!` })
    }
    const options = {
      folder: "home/reddit-clone",
      resource_type: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    }
    let result
    if (req?.file?.path) {
      result = await cloudinary.uploader.upload(req.file.path, options)
    }
    // console.log(result)
    let url = result?.secure_url || ''
    let format = result?.format || ''
    const post = await Post.create({ ...req.body, description: req.body.description.trim(), createdBy: req.user.userId, creator: req.user.name, createdAt: new Date().toISOString(), file: { url: url, format: format }, creatorImage: user.image })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json(error)
  }
}

const updatePost = async (req, res) => {
  try {
    // console.log('update post')
    const { id } = req.params
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(404).json({ message: `User wasn't found!` })
    }
    const options = {
      folder: "home/reddit-clone",
      resource_type: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    }
    let result
    if (req?.file?.path) {
      result = await cloudinary.uploader.upload(req.file.path, options)
    }
    let url = result?.secure_url || ''
    let format = result?.format || ''
    const post = await Post.findByIdAndUpdate(id, { ...req.body, file: { url: url, format: format } }, { new: true })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    await Post.findByIdAndDelete(id)
    // send the id for the redux state filter
    res.status(201).json(id)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const likePost = async (req, res) => {
  try {
    const { id } = req.params
    if (!req.user.userId) {
      return res.status(401).json({ message: `Unauthorized` })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `this id : ${id} is not valid` })
    }

    const likedPost = await Post.findByIdAndUpdate({ _id: id }, { $push: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ likedPost: likedPost, hasLikedPost: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const unlikePost = async (req, res) => {
  try {
    const { id } = req.params
    if (!req.user.userId) {
      return res.status(401).json({ message: `Unauthorized` })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: `this id : ${id} is not valid` })
    }

    const unlikedPost = await Post.findByIdAndUpdate({ _id: id }, { $pull: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ unlikedPost: unlikedPost, hasLikedPost: false })
  } catch (error) {
    res.status(500).json({ message: error.massage })
  }
}

const commentPost = async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    // const post = await Post.findById(id)
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: `User wasn't found!` })
    }

    // if (comment.length > 0) {
    //   post.comments.push({ comment: comment, creatorImage: user.image })
    // } else {
    //   return res.status(500).json({ message: `You can't make an empty comment` })
    // }

    // const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true })
    const commentedPost = await Post.findByIdAndUpdate({ _id: id }, {
      $push: {
        comments: {
          comment: comment,
          creatorImage: user.image
        }
      }
    }, { new: true })

    res.status(200).json({ post: commentedPost })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getRandomTags = async (req, res) => {
  try {
    let tags = []
    const posts = await Post.find({ creatdAt: 1 }).limit(10)
    posts.forEach(post => {
      post.tags.forEach(postTag => {
        if (tags.length <= 6) {
          if (tags.find(tag => tag === postTag) === undefined) {
            tags.push(postTag)
          }
        }
      })
    })
    res.status(200).json(tags)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getPosts,
  getPostsBySearch,
  getPostsByCreator,
  getSinglePost,
  getSubredditPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  commentPost,
  // uploadImage,
  getRandomTags
}