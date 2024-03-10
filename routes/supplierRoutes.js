const express = require('express')
const router = express.Router()
const { createSupplier } = require('../controllers/supplier')

router.post('/', createSupplier)

module.exports = router
