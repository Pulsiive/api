import express from 'express';
import JWTService from '../Services/JWTService';
import { errorWrapper } from '../Utils/errorWrapper';
import AuthService from '../Services/Auth/AuthService';

export async function AuthAndGuestMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.headers.authorization) {
    next();
    return;
  }

  const bearer = req.headers.authorization.split(' ');
  const bearerToken = bearer[1];

  if (!bearerToken) {
    return res.status(401).json({
      message: 'Error: Invalid Token'
    });
  }

  try {
    req.body.user = await JWTService.verifyWrapper(bearerToken);
    await AuthService.checkUserExist(req.body.user.payload.id);
    next();
  } catch (e: any) {
    return errorWrapper(e, res);
  }
}
