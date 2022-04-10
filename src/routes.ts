import express from 'express';
import AuthController from './Controllers/AuthController';

const router = express.Router();

router.get('/api/v1', (req: express.Request, res: express.Response) => {
    res.json({});
});

router.post('/api/v1/auth/register', AuthController.register);

export = router;
