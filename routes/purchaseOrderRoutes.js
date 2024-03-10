const express = require('express')
const { createPurchaseOrder, getPurchaseOrderById, getAllPurchaseOrders } = require('../controllers/purchaseOrder')
const router = express.Router()

router.get('/all', getAllPurchaseOrders)
router.post('/', createPurchaseOrder)
router.get('/:id', getPurchaseOrderById)

module.exports = router
