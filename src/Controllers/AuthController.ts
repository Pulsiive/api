import express from 'express';
import AuthService from '../Services/Auth/AuthService';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import { ApiError } from '../Errors/ApiError';

class AuthController {
  static async register(req: express.Request, res: express.Response) {
    try {
      const { email, password, firstName, lastName, dateOfBirth } = req.body;
      const data = { email, password, firstName, lastName, dateOfBirth };
      const validator = new Validator(data, {
        email: `required|email`,
        password: 'required|string|min:8',
        firstName: 'required|string|max:300',
        lastName: 'required|string|max:300',
        dateOfBirth: 'required|date'
      });

      if (validator.fails()) {
        return res.status(422).json({ message: 'Error: User registration failed' });
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
  
  static async googleLogin(req: express.Request, res: express.Response) {
    const { tokenId } = req.body;

    try {
        const user = await AuthService.googleLogin(tokenId);

        return res.json(user)
    } catch (e: any) {
        return errorWrapper(e, res)
    }
}

  static async reqPasswordReset(req: express.Request, res: express.Response) {
    try {
      const { email } = req.body;
      const data = { email };

      const validator = new Validator(data, {
        email: 'required|email'
      });

      if (validator.fails()) throw new ApiError('Error: Unprocessable entity', 422);

      const state = await AuthService.reqPasswordReset(email);

      res.json({ success: state });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async resetPassword(req: express.Request, res: express.Response) {
    try {
      const { email, password, password_confirmation } = req.body;
      const data = { email, token: req.params.token, password, password_confirmation };

      const validator = new Validator(data, {
        email: 'required|email',
        token: 'required|string',
        password: 'required|string|min:8|confirmed',
        password_confirmation: 'required|string'
      });

      if (validator.fails()) throw new ApiError('Error: Unprocessable entity', 422);

      const state = await AuthService.resetPassword(email, data.token, data.password);

      res.json({ success: state });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default AuthController;
