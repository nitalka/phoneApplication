const express=require('express');
const router=express.Router();

const userController = require('../controllers/userController');

router.get('/users', userController.getAllUsers);

router.get('/user/:phoneNo', userController.getCachedData, userController.getUserByNumber);

router.post('/user', userController.createNewUser);

router.put('/user/:phoneNo', userController.updateUserByNumber);

router.delete('/user/:phoneNo', userController.deleteUserByNumber);

router.get('/users/page', userController.getUsersPaginated);

module.exports=router;
