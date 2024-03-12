const express = require('express')
const router = express.Router()
const { createSupplier, getSuppliers } = require('../controllers/supplier')

router.post('/', createSupplier)
router.get('/', getSuppliers)

module.exports = router
