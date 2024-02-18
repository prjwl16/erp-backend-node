const {Router} = require('express');

const router = Router();


router.use('/products', require('./productRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/warehouses', require('./warehouseRoutes'));


module.exports = router;
