import express from 'express';
import JWTService from '../../Services/JWTService';
import { errorWrapper } from '../../Utils/errorWrapper';
import AuthService from "../../Services/Admin/AuthService";

export async function AuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.headers.authorization) {
        return res.status(401).json({
            message: 'Error: Access token is required',
        });
    }

    const bearer = req.headers.authorization.split(' ');
    const bearerToken = bearer[1];

    if (!bearerToken) {
        return res.status(401).json({
            message: 'Error: Invalid Token',
        });
    }

    try {
        req.body.admin = await JWTService.verifyWrapper(bearerToken);
        await AuthService.checkAdminExist(req.body.admin.payload.id);
        next();
    } catch (e: any) {
        console.log("error token")
        return errorWrapper(e, res);
    }
}
