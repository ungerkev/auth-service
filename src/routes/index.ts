import 'reflect-metadata';
import express from 'express';
import Container from 'typedi';

import { StatusController } from '../controller/status.controller';
import { AuthController } from '../controller/auth.controller';
import { UserController } from '../controller/user.controller';
import {AddressController} from '../controller/address.controller';

const statusController = Container.get(StatusController);
const authController = Container.get(AuthController);
const userController = Container.get(UserController);
const addressController = Container.get(AddressController);

const router = express.Router();

/**
 * Status Routes
 */
router.get('/', statusController.status);

/**
 * Auth Routes
 */
router.post('/login', authController.loginController);
router.get('/logout/:userId', authController.logoutController);
router.get('/isAuthenticated', authController.isAuthenticatedController);

/**
 * User Routes
 */
router.put('/saveRefreshToken', userController.saveRefreshTokenController);
router.get('/userId', userController.getIdController);

/**
 * Address Routes
 */
router.post('/saveAddress', addressController.saveAddressController);
router.get('/addresses/:userId', addressController.getAddressListOfUserIdController);
router.delete('/deleteAddress/:id', addressController.deleteAddressByIdController);
router.patch('/updateAddress/:id', addressController.updateAddressController);
router.get('/address/:id', addressController.getAddressOfIdController);

module.exports = router;
