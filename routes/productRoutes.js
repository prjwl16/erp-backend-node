// routes/productRoutes.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const {s3} = require("../utils/storage");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Generate unique key for the file
    }
  })
});


router.post('/', productController.createProduct);
router.post('/upload/:productId',upload.array('images'), productController.uploadImages) ;
router.post('/details', productController.createProductWithDetails);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
