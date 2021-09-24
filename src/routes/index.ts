import 'reflect-metadata';
import express from 'express';
import Container from 'typedi';

import { StatusController } from '../controller/status.controller';
import { AuthController } from '../controller/auth.controller';
import { UserController } from '../controller/user.controller';

const statusController = Container.get(StatusController);
const authController = Container.get(AuthController);
const userController = Container.get(UserController);

const router = express.Router();

/**
 * Status Routes
 */
router.get('/', statusController.status);

/**
 * Auth Routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/checkToken', authController.checkToken);
router.post('/refreshToken', authController.refreshToken);
router.post('/isAdmin', authController.checkIsAdmin);

/**
 * User Routes
 */
router.put('/saveRefreshToken', userController.saveRefreshToken);
router.post('/saveAddress', userController.saveAddress);
router.get('/addresses/:userId', userController.doGetAddressListOfUserId);
router.get('/userId', userController.getIdOfToken);

module.exports = router;
