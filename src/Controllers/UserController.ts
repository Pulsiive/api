import express from 'express';
import UserService from '../Services/User/UserService';
import { VehicleInput } from '../Utils/types';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import AuthService from '../Services/Auth/AuthService';
import updateProfileRules from '../Rules/updateProfileRules';
import { ApiError } from '../Errors/ApiError';

class UserController {
  static async getVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = req.body.user.payload.id;

      const vehicle = await UserService.getVehicle(vehicleId, userId);
      return res.json({ vehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicle: VehicleInput = req.body.vehicle;
      const userId = req.body.user.payload.id;

      const createdVehicle = await UserService.createVehicle(vehicle, userId);
      return res.json({ createdVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const vehicleConfig = req.body.vehicle;
      const userId = req.body.user.payload.id;

      const createdVehicle = await UserService.updateVehicle(vehicleId, vehicleConfig, userId);
      return res.json({ createdVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = req.body.user.payload.id;

      const deletedVehicle = await UserService.deleteVehicle(vehicleId, userId);
      return res.json({ deletedVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getStation(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const station = await UserService.getStation(stationId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createStation(req: express.Request, res: express.Response) {
    try {
      const stationsProperties = req.body.station;
      const userId = req.body.user.payload.id;
      const station = await UserService.createStation(stationsProperties, userId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateStation(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const stationsProperties = req.body.station;
      const userId = req.body.user.payload.id;
      const station = await UserService.updateStation(stationsProperties, userId, stationId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteStation(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const userId = req.body.user.payload.id;

      const deletedStation = await UserService.deleteStation(stationId, userId);
      return res.json({ deletedStation });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    try {
      const id = req.body.user.payload.id;
      const user = await prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          emailVerifiedAt: true,
          dateOfBirth: true,
          balance: true
        }
      });

      return res.json(user);
    } catch (e: any) {
      return res.status(422).json({
        message: 'Unprocessable entity'
      });
    }
  }

  static async update(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const {
        firstName,
        lastName,
        dateOfBirth,
        email,
        password,
        new_password,
        new_password_confirmation
      } = req.body;
      const data = {
        firstName,
        lastName,
        dateOfBirth,
        email,
        password,
        new_password,
        new_password_confirmation
      };
      const validator = new Validator(data, updateProfileRules);

      if (validator.fails()) return res.status(422).json({ error: 'unexpected-error' });
      if (data.email && !(await AuthService.checkEmail(data.email, userId)))
        return res.status(422).json({ error: 'email-already-taken' });
      if (data.password && !(await AuthService.checkPassword(data.password, userId)))
        return res.status(422).json({ error: 'bad-password' });

      const state = await UserService.update(userId, data);

      return res.json({
        success: state
      });
    } catch (e: any) {
      console.log(e);
      return res.status(422).json({
        error: 'unexpected-error'
      });
    }
  }

  static async getMessages(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messages = await UserService.getMessages(userId);
      return res.json(messages);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getMessage(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messageId = req.params.id;

      const message = await UserService.getMessage(messageId, userId);
      return res.json(message);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteMessage(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messageId = req.params.id;

      const deletedMessage = await UserService.deleteMessage(messageId, userId);
      return res.json(deletedMessage);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createMessage(req: express.Request, res: express.Response) {
    try {
      const message = req.body.message;
      const userId = req.body.user.payload.id;
      const validator = new Validator(message, {
        receiverId: 'required|string',
        body: 'required|string|min:1|max:300',
        createdAt: 'required|date'
      });
      if (validator.passes() && req.body.user.payload.id !== message.receiverId) {
        const newMessage = await UserService.createMessage(message, userId);
        return res.json(newMessage);
      }
      throw new ApiError('Invalid input', 400);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default UserController;
