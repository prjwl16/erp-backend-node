const express = require('express')
const { createPurchaseOrderTransaction } = require('../controllers/purchaseOrderTransaction')
const router = express.Router()

router.post('/', createPurchaseOrderTransaction)

module.exports = router
