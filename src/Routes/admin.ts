import express from 'express';
import AuthController from '../Controllers/Admin/AuthController';
import { AuthMiddleware } from '../Middlewares/Admin/AuthMiddleware';

const router = express.Router();

router.post('/api/v1/admin/auth/login', AuthController.login);

//router.get('/api/v1/admin/example', AuthMiddleware, test);

export = router;
