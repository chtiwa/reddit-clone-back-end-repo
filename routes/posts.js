const express = require('express')
const router = express.Router()
const {
  getPosts,
  getPostsBySearch,
  getPostsByCreator,
  getSubredditPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  commentPost,
  getRandomTags
} = require('../controllers/posts')
const authentication = require('../middleware/authentication')


// /posts

router.route('/').get(getPosts).post(authentication, createPost)
router.route('/find').get(getPostsBySearch)
router.route('/user/myposts').get(authentication, getPostsByCreator)
router.route('/tags').get(getRandomTags)

// to not get the error of castObjectId
router.route('/r/:tag').get(getSubredditPosts)
router.route('/likepost/:id').patch(authentication, likePost)
router.route('/commentpost/:id').patch(authentication, commentPost)

router.route('/:id').get(getSinglePost).patch(authentication, updatePost).delete(authentication, deletePost)

module.exports = router