import express from 'express';
import AuthService from '../Services/AuthService';
import {errorWrapper} from "../Utils/errorWrapper";

class AuthController {
    static async register(req: express.Request, res: express.Response) {
        try {
            const accessToken = await AuthService.register({
                email: '',
                password: '',
                fistName: '',
                lastName: '',
                dateOfBirth: new Date(),
                timeZone: ''
            });

            return res.json({
                accessToken
            });
        } catch (e: any) {
            return errorWrapper(e, res);
        }
    }
}

export default AuthController;
