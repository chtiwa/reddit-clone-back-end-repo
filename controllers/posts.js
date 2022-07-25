const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors')

// subreddit (by tags)
// search on the navbar search (modal)
// get posts for the home page

const getPosts = async (req, res) => {
  // search engine by tags
  // grab the UserSchema 
  // get diffrent users and select the tags that the user has searched for
  // make one get posts based on the search query i.e : creator tag 
  try {
    const { page } = req.query
    // console.log('page', page)
    const LIMIT = 10
    const startIndex = (Number(page) - 1) * LIMIT

    const total = await Post.countDocuments({})

    const posts = await Post.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex)

    const pages = Math.ceil(total / LIMIT)
    // res.status(200).json({ posts: posts, page: Number(page), pages: pages })
    res.status(200).json({ posts: posts, pages: pages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSubredditPosts = async (req, res) => {
  try {
    const { page } = req.query
    const { tag } = req.params
    // console.log(tag)
    const LIMIT = 10
    const startIndex = (Number(page) - 1) * LIMIT

    let posts = await Post.find({ tags: { $in: tag } })
    if (posts.length === 0 || tag === undefined || tag === '') {
      return res.status(404).json({ message: `No subreddit was found!` })
    }
    const total = posts.length
    const pages = Math.ceil(total / LIMIT)

    if (page > pages) {
      return res.status(404).json({ message: `Page not found!` })
    }
    posts = await Post.find({ tags: { $in: tag } }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)

    res.status(200).json({ posts: posts, pages: pages })
  } catch (error) {
    // throw new CustomAPIError.BadRequestError('Bad request')
    res.status(500).json({ message: error.message })
  }
}

const getPostsBySearch = async (req, res) => {
  // const { searchQuery, tags } = req.query
  const { search } = req.query
  // this would be in the modal so the limit would be ten posts order by id
  // the recommendation system functions here (trending)
  try {
    const title = new RegExp(search, "i")
    const posts = await Post.find({ title: { $in: title } }).limit(10)
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
    const { id } = req.params
    const post = await Post.findById(id)
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createPost = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(404).json({ message: `User wasn't found!` })
    }
    const post = await Post.create({ ...req.body, description: req.body.description.trim(), createdBy: req.user.userId, creator: req.user.name, createdAt: new Date().toISOString(), creatorImage: user.image })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json(error)
  }
}

const updatePost = async (req, res) => {
  try {
    console.log('update post')
    const { id } = req.params
    const post = await Post.findByIdAndUpdate(id, { ...req.body }, { new: true })
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deletePost = async (req, res) => {
  try {
    const { id } = req.params
    await Post.findByIdAndDelete(id)
    res.status(201).json({ message: `Post was deleted successfully` })
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

    const post = await Post.findById(id)

    const index = post.likes.findIndex((id) => id === String(req.user.userId))

    let hasLikedPost
    if (index === -1) {
      post.likes.push(req.user.userId)
      hasLikedPost = true
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.user.userId))
      hasLikedPost = false
    }

    const likedPost = await Post.findByIdAndUpdate(id, post, { new: true })
    // console.log(likedPost.likes.length)

    res.status(200).json({ likedPost: likedPost, likes: likedPost.likes, hasLikedPost })
    // res.status(200).json({ likedPost, hasLikedPost })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const commentPost = async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    // console.log(req.body)
    const post = await Post.findById(id)
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: `User wasn't found!` })
    }

    if (comment.length > 0) {
      post.comments.push({ comment: comment, creatorImage: user.image })
    } else {
      return res.status(500).json({ message: `You can't make an empty comment` })
    }

    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true })

    res.status(200).json({ post: updatedPost, comments: updatedPost.comments })
    // res.status(200).json(updatedPost)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getRandomTags = async (req, res) => {
  try {
    let tags = []
    const posts = await Post.find({}).limit(10)
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (tags.length <= 6) {
          tags.push(tag)
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
  commentPost,
  getRandomTags
}