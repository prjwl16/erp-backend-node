const {Router} = require('express');

const router = Router();


router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/category', require('./categoryRoutes'));
router.use('/warehouse', require('./warehouseRoutes'));



module.exports = router;
