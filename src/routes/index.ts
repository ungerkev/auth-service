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
router.post('/login', authController.login);
router.get('/logout/:userId', authController.logout);
router.get('/isAuthenticated', authController.checkIsAuthenticated);

/**
 * User Routes
 */
router.put('/saveRefreshToken', userController.saveRefreshToken);
router.post('/saveAddress', userController.saveAddress);
router.get('/addresses/:userId', userController.doGetAddressListOfUserId);
router.get('/userId', userController.getId);

module.exports = router;
