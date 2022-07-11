import express from 'express';
import AuthService from '../../Services/Admin/AuthService';
import { errorWrapper } from '../../Utils/errorWrapper';

class AuthController {
    static async login(req: express.Request, res: express.Response) {
        try {
            const admin = await AuthService.login(req.body);
            return res.json(admin);
        } catch (e: any) {
            console.log(e);
            return errorWrapper(e, res)
        }
    }
}

export default AuthController;
