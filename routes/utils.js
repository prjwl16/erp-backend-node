const express = require('express')
const router = express.Router()

const utilsController = require('../controllers/utilsController')

router.post('/create-productType', utilsController.createProductType)

module.exports = router
