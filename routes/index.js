const {Router} = require('express');
const {verifyToken} = require("../middlewares/jwt");

const router = Router();


//Protected route

const getProtectedRoutes = () => {
  const router = Router();

  router.use('/products', require('./productRoutes'));
  router.use('/users', require('./userRoutes'));
  router.use('/category', require('./categoryRoutes'));
  router.use('/warehouse', require('./warehouseRoutes'));

  return router;
}

router.use('/auth', require('./authRoutes'));
router.use('/api', verifyToken, getProtectedRoutes);


module.exports = router;
