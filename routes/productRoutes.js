// routes/productRoutes.js
const express = require('express')
const router = express.Router()
const productController = require('../controllers/productControllers')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { s3 } = require('../utils/storage')
const { isValidWarehouse } = require('../middlewares/warehosue')
const { isValidCategory } = require('../middlewares/category')

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString()) // Generate unique key for the file
    },
  }),
})

router.post('/', upload.array('images', 10), isValidCategory, isValidWarehouse, productController.createProduct)
router.get('/pages', productController.getProducts)
router.get('/:id', productController.getProductById)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

module.exports = router
