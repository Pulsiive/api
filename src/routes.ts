import express from 'express';
import AuthController from './Controllers/AuthController';
import UserController from './Controllers/UserController';

const router = express.Router();

router.get('/api/v1', (req: express.Request, res: express.Response) => {
  res.json({});
});

router.post('/api/v1/auth/register', AuthController.register);

router.get('/api/v1/profile/vehicle/:id', UserController.getVehicle);
router.post('/api/v1/profile/vehicle', UserController.createVehicle);
router.post('/api/v1/profile/vehicle/:id', UserController.updateVehicle);
router.delete('/api/v1/profile/vehicle/:id', UserController.deleteVehicle);

export = router;
