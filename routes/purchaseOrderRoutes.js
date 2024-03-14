const express = require('express')
const { createPurchaseOrder, getPurchaseOrderById, getAllPurchaseOrders, updatePurchaseOrderStatus } = require('../controllers/purchaseOrder')
const { isValidCreatPurchaseOrderRequest } = require('../middlewares/purchase-order')
const router = express.Router()

router.get('/pages', getAllPurchaseOrders)
router.post('/', isValidCreatPurchaseOrderRequest, createPurchaseOrder)
router.get('/:id', getPurchaseOrderById)
router.put('/status/:id', updatePurchaseOrderStatus)

module.exports = router
