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
  unlikePost,
  commentPost,
  getRandomTags,
  // uploadImage
} = require('../controllers/posts')
const authentication = require('../middleware/authentication')
const multer = require('../utils/multerPost')
// const fileUpload = fileupload()
// /posts

// router.route('/').get(getPosts).post(authentication, parser.single('image'), createPost)
router.route('/').get(getPosts).post(authentication, multer.single('file'), createPost)
// router.route('/upload').post(upload.single('file'), uploadImage)
router.route('/find').get(getPostsBySearch)
router.route('/user/myposts').get(authentication, getPostsByCreator)
router.route('/tags').get(getRandomTags)

// to not get the error of castObjectId
router.route('/r/:tag').get(getSubredditPosts)
router.route('/likepost/:id').patch(authentication, likePost)
router.route('/unlikepost/:id').patch(authentication, unlikePost)
router.route('/commentpost/:id').patch(authentication, commentPost)

router.route('/:id/:userId').get(getSinglePost)
router.route('/:id').patch(authentication, multer.single('file'), updatePost).delete(authentication, deletePost)

module.exports = router