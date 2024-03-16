import { Router } from 'express'
import authRouter from '../controllers/authController.js'

const router = Router()

//Protected route

router.use('/auth', authRouter)

// router.use('/api/product', verifyToken, require('./productRoutes'))
// router.use('/api/user', verifyToken, require('./userRoutes'))
// router.use('/api/category', verifyToken, require('./categoryRoutes'))
// router.use('/api/warehouse', verifyToken, require('./warehouseRoutes'))
// router.use('/api/utils', verifyToken, require('./utils'))
// router.use('/api/supplier', verifyToken, require('./supplierRoutes'))
// router.use('/api/purchase-order', verifyToken, require('./purchaseOrderRoutes'))
// router.use('/api/purchase-order-transaction', verifyToken, require('./purchaseOrderTransactionRoutes'))

export default router
