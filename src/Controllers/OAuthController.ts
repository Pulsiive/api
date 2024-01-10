import express from 'express';
import OAuthService from '../Services/OAuth/OAuthService';
import { errorWrapper } from '../Utils/errorWrapper';
import { ApiError } from '../Errors/ApiError';

class OAuthController {
  static async register(req: express.Request, res: express.Response) {
    try {
      if (!req.body.credential) throw new ApiError('Error: Google ID token not provided', 422);

      const verificationResponse = await OAuthService.verifyGoogleToken(req.body.credential);

      const profile = verificationResponse?.payload;

      const userData = await OAuthService.register(req.body.credential, {
        email: profile?.email,
        firstName: profile?.given_name,
        lastName: profile?.family_name,
        fcmToken: req.body.fcmToken
      });

      return res.json(userData);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async login(req: express.Request, res: express.Response) {
    try {
      if (!req.body.credential) throw new ApiError('Error: Google ID token not provided', 422);

      const verificationResponse = await OAuthService.verifyGoogleToken(req.body.credential);

      const profile = verificationResponse?.payload;

      const userData = await OAuthService.login(profile?.email);

      return res.json(userData);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }
}

export default OAuthController;
