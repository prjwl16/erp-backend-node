const express = require('express')
const { createPurchaseOrder, getPurchaseOrderById, getAllPurchaseOrders } = require('../controllers/purchaseOrder')
const { isValidCreatPurchaseOrderRequest } = require('../middlewares/purchase-order')
const router = express.Router()

router.get('/pages', getAllPurchaseOrders)
router.post('/', isValidCreatPurchaseOrderRequest, createPurchaseOrder)
router.get('/:id', getPurchaseOrderById)

module.exports = router
