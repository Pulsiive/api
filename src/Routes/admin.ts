import express from 'express';
import AuthController from '../Controllers/Admin/AuthController';
import { AuthMiddleware } from '../Middlewares/Admin/AuthMiddleware';
import prisma from "../../prisma/client";

const router = express.Router();

router.post('/api/v1/admin/auth/login', AuthController.login);

router.get('/api/v1/admin/users', async (req: express.Request, res: express.Response) => {
    const users = await prisma.user.findMany({});
    res.json(users);
});

//router.get('/api/v1/admin/example', AuthMiddleware, test);

export = router;
