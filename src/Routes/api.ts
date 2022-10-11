import express from 'express';
import AuthController from '../Controllers/AuthController';
import UserController from '../Controllers/UserController';
import { AuthMiddleware } from '../Middlewares/AuthMiddleware';
import axios from 'axios';

const router = express.Router();

router.post('/api/v1/auth/register', AuthController.register);
router.post('/api/v1/auth/login', AuthController.login);
router.post('/api/v1/auth/facebookLogin', AuthController.facebookLogin);
router.post('/api/v1/auth/githubLogin', AuthController.githubOAuthHandler);
router.post('/api/v1/auth/googleLogin', AuthController.googleOAuthHandler);

router.post('/api/v1/auth/resetPassword/:token', AuthController.resetPassword);
router.post('/api/v1/auth/requestPasswordReset', AuthController.reqPasswordReset);

router.get('/api/v1/profile', AuthMiddleware, UserController.index);
router.patch('/api/v1/profile', AuthMiddleware, UserController.update);

router.get('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.getVehicle);
router.post('/api/v1/profile/vehicle', AuthMiddleware, UserController.createVehicle);
router.put('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.updateVehicle);
router.delete('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.deleteVehicle);

router.get('/api/v1/profile/station/:id', UserController.getStation);
router.post('/api/v1/profile/station', AuthMiddleware, UserController.createStation);
router.put('/api/v1/profile/station/:id', AuthMiddleware, UserController.updateStation);
router.delete('/api/v1/profile/station/:id', AuthMiddleware, UserController.deleteStation);

router.get('/api/v1/profile/message/:id', AuthMiddleware, UserController.getMessage);
router.get('/api/v1/profile/messages', AuthMiddleware, UserController.getMessages);
router.delete('/api/v1/profile/message/:id', AuthMiddleware, UserController.deleteMessage);
router.post('/api/v1/profile/message', AuthMiddleware, UserController.createMessage);

export = router;
