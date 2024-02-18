// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

router.post('/', productController.createProduct);
router.post('/details', productController.createProductWithDetails);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
