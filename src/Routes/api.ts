import express from 'express';
import AuthController from '../Controllers/AuthController';
import {AuthMiddleware} from "../Middlewares/AuthMiddleware";

const router = express.Router();

router.get('/api/v1', (req: express.Request, res: express.Response) => {
    res.json({
        info: 'test'
    });
});

router.get('/api/v1/test-middleware', AuthMiddleware, (req: express.Request, res: express.Response) => {
    res.json({
        info: 'test middleware'
    });
});

router.post('/api/v1/auth/register', AuthController.register);

export = router;
