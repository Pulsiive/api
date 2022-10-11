import express from 'express';
import AuthService from '../Services/Auth/AuthService';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import { ApiError } from '../Errors/ApiError';
import axios from 'axios';
import { getGithubOAuthToken, getGithubUser } from '../Services/Auth/oauth.service';
import { getGoogleOauthToken, getGoogleUser } from '../Services/Auth/oauth.service';

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

  static async googleOAuthHandler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      // Get the code from the query
      const code = req.body.code as string;

      if (req.query.error) {
        throw new ApiError('Error: Github login failed', 401);
      }

      if (!code) {
        throw new ApiError('Authorization code not provided!', 401);
      }

      // Get the user the access_token with the code
      const { id_token, access_token } = await getGoogleOauthToken({ code });
      console.log('accesstoken => ', access_token);
      console.log('id_token => ', id_token);

      // Get the user with the access_token
      const { name, verified_email, email, picture } = await getGoogleUser({
        id_token,
        access_token
      });
      if (!verified_email) {
        throw new ApiError('Google account not verified', 403);
      }
      const id = 12456;

      let data: any = {};
      data.email = email ?? 'test@test.fr';
      data.password = id.toString();
      data.firstName = name;
      data.lastName = name;
      data.dateOfBirth = new Date();

      const accessToken = await AuthService.oauthLogin(data);
      return res.json(accessToken);
    } catch (err: any) {
      return errorWrapper(err, res);
    }
  }

  static async githubLogin(req: express.Request, res: express.Response) {
    const accessToken = req.body.accessToken;
    const { data } = await axios({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
  }

  static async githubOAuthHandler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      // Get the code from the query
      const code = req.body.code as string;

      if (req.query.error) {
        throw new ApiError('Error: Github login failed', 401);
      }

      if (!code) {
        throw new ApiError('Authorization code not provided!', 401);
      }

      // Get the user the access_token with the code
      const { access_token } = await getGithubOAuthToken({ code });

      // Get the user with the access_token
      const dataUser = await getGithubUser({ access_token });

      const { email, id, name } = dataUser;

      let data: any = {};
      data.email = email ?? 'tes@test.fr';
      data.password = id.toString();
      data.firstName = name;
      data.lastName = name;
      data.dateOfBirth = new Date();

      const UserData = await AuthService.oauthLogin(data);
      return res.json(UserData);
    } catch (err: any) {
      return errorWrapper(err, res);
    }
  }

  static async facebookLogin(req: express.Request, res: express.Response) {
    try {
      const accessToken = req.body.accessToken;

      const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
          fields: ['id', 'email', 'first_name', 'last_name', 'birthday'].join(','),
          access_token: accessToken
        }
      });

      const UserData = await AuthService.facebookLogin(data);
      console.log(UserData);
      return res.json({
        email: data.email,
        firstName: UserData.firstName,
        lastname: UserData.lastName
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
