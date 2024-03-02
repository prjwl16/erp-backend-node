const {Router} = require('express');
const {verifyToken} = require("../middlewares/jwt");

const router = Router();


//Protected route

router.use('/auth', require('./authRoutes'));

router.use('/api/product',verifyToken, require('./productRoutes'));
router.use('/api/user',verifyToken, require('./userRoutes'));
router.use('/api/category',verifyToken, require('./categoryRoutes'));
router.use('/api/warehouse',verifyToken, require('./warehouseRoutes'));


module.exports = router;
