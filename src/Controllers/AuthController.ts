import express from 'express';
import AuthService from '../Services/AuthService';
import {errorWrapper} from "../Utils/errorWrapper";
import Validator from "validatorjs";

class AuthController {
    static async register(req: express.Request, res: express.Response) {
        try {
            const {email, password, firstName, lastName, dateOfBirth, timeZone} = req.body;
            const data = {email, password, firstName, lastName, dateOfBirth, timeZone};
            const validator = new Validator(data, {
                email: `required|email`,
                password: 'required|string|min:8',
                firstName: 'required|string|max:300',
                lastName: 'required|string|max:300',
                dateOfBirth: 'required|date',
                timeZone: 'required|string|in:UTC',
            });

            if (validator.fails()) {
                return res.status(422).json({message: 'Error: User registration failed'});
            }

            const accessToken = await AuthService.register(data);

            return res.json({
                accessToken
            });
        } catch (e) {
            return errorWrapper(e, res);
        }
    }

    static async login(req: express.Request, res: express.Response) {
        try {
            const accessToken = await AuthService.login(req.body);

            return res.json({
                accessToken
            });
        } catch (e: any) {
            return errorWrapper(e, res);
        }
    }
}

export default AuthController;
