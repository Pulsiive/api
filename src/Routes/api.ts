import express from 'express';
import AuthController from '../Controllers/AuthController';
import UserController from '../Controllers/UserController';
import {AuthMiddleware} from "../Middlewares/AuthMiddleware";
import prisma from "../../prisma/client";

const router = express.Router();

router.get('/api/v1', (req: express.Request, res: express.Response) => {
  res.json({
    info: 'test'
  });
});

router.post('/api/v1/auth/register', AuthController.register);
router.post('/api/v1/auth/login', AuthController.login);

router.post('/api/v1/auth/resetPassword/:token', AuthController.resetPassword);
router.post('/api/v1/auth/requestPasswordReset', AuthController.reqPasswordReset);

router.get(
  '/api/v1/test-middleware',
  AuthMiddleware,
  (req: express.Request, res: express.Response) => {
    res.json({
      info: 'test middleware'
    });
  }
);

router.get('/api/v1/users', async (req: express.Request, res: express.Response) => {
    const users = await prisma.user.findMany({});
    console.log('test', users);
    res.json(users);
});

router.get('/api/v1/profile/vehicle/:id', UserController.getVehicle);
router.post('/api/v1/profile/vehicle', UserController.createVehicle);
router.put('/api/v1/profile/vehicle/:id', UserController.updateVehicle);
router.delete('/api/v1/profile/vehicle/:id', UserController.deleteVehicle);

router.get('/api/v1/profile/station/:id', UserController.getStation);
router.post('/api/v1/profile/station', UserController.createStation);
router.put('/api/v1/profile/station/:id', UserController.updateStation);
router.delete('/api/v1/profile/station/:id', UserController.deleteStation);

export = router;
