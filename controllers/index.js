import { Router } from 'express'
import authRouter from './authController.js'
import { verifyToken } from '../middlewares/jwt.js'
import categoryRouter from './categoryController.js'
import productRouter from './productControllers.js'
import purchaseOrderRouter from './purchaseOrder.js'
import supplierRouter from './supplier.js'
import userRouter from './userController.js'
import utilsController from './utilsController.js'
import warehouseRouter from './warehouseController.js'
import purchaseOrderTransactionsRouter from './purchaseOrderTransaction.js'
import salesRouter from './sales.js'

const router = Router()

router.use('/auth', authRouter)
//Protected route

const protectedRouter = Router()
protectedRouter.use('/category', categoryRouter)
protectedRouter.use('/product', productRouter)
protectedRouter.use('/purchase-order', purchaseOrderRouter)
protectedRouter.use('/supplier', supplierRouter)
protectedRouter.use('/user', userRouter)
protectedRouter.use('/utils', utilsController)
protectedRouter.use('/warehouse', warehouseRouter)
protectedRouter.use('/purchase-order-transaction', purchaseOrderTransactionsRouter)
protectedRouter.use('/sales', salesRouter)

router.use(verifyToken, protectedRouter)

router.get('/cal', (req, res) => {
  res.send('Hello')
})

router.post('/cal', (req, res) => {
  console.log(req.body)
  res.send('Hello')
})

export default router
