import express from 'express';
import AuthService from '../Services/AuthService';
import {errorWrapper} from "../Utils/errorWrapper";

class AuthController {
    static async register(req: express.Request, res: express.Response) {
        try {
            const accessToken = await AuthService.register({
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateOfBirth: new Date(req.body.dateOfBirth),
                timeZone: req.body.timeZone
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
