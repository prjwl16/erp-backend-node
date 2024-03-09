const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');


router.post('/', userController.createUser);
router.get('/', userController.getUser);
router.get('/all', userController.getAllUsers);


module.exports = router;
