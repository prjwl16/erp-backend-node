const { Router } = require('express')
const router = Router()

const authController = require('../controllers/authController')

router.post('/register/client', authController.register)
//route to check if email is already registered
router.post('/check', authController.check)
router.post('/login', authController.login)

module.exports = router
