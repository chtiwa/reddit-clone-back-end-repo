const multer = require("multer")
const path = require('path')

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg' && ext !== '.webp' && ext !== '.mov' && ext !== '.mp4' && ext !== '.avi' && ext !== '.gif' && ext !== '.wmv' && ext !== '.webm' && ext !== '.gif') {
      cb(new Error('File type is not supported'), false)
      return
    }
    cb(null, true)
  }
})