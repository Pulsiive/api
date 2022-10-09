import express from 'express';
import AuthService from '../Services/Auth/AuthService';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import { ApiError } from '../Errors/ApiError';
import EmailVerificationService from "../Services/EmailVerification/EmailVerificationService";

class EmailVerificationController {
  static async request(req: express.Request, res: express.Response) {
    try {
      const { email } = req.body;
      const data = { email };

      const validator = new Validator(data, {
        email: 'required|email'
      });

      if (validator.fails()) throw new ApiError('Error: Unprocessable entity', 422);

      const state = await EmailVerificationService.request(email);

      res.json({ success: state });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async verify(req: express.Request, res: express.Response) {
    try {
      const data = { email: req.body.email, token: req.params.token };

      const validator = new Validator(data, {
        email: 'required|email',
        token: 'required|string'
      });

      if (validator.fails()) throw new ApiError('Error: Unprocessable entity', 422);

      const state = await EmailVerificationService.verify(data.email, data.token);

      res.json({ success: state });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default EmailVerificationController;
