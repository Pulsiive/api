import express from 'express';
import UserService from '../Services/User/UserService';
import { VehicleInput } from '../Utils/types';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import AuthService from '../Services/Auth/AuthService';
import updateProfileRules from '../Rules/updateProfileRules';

class UserController {
  static async getVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const vehicle = await UserService.getVehicle(vehicleId, userId);
      return res.json({ vehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicle: VehicleInput = req.body.vehicle;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

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
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const createdVehicle = await UserService.updateVehicle(vehicleId, vehicleConfig, userId);
      return res.json({ createdVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

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
      const userId = 'b79e315a-da17-4b1a-96a1-fc363bf1cbff';
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
      const userId = 'b79e315a-da17-4b1a-96a1-fc363bf1cbff';
      const station = await UserService.updateStation(stationsProperties, userId, stationId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteStation(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const userId = 'b79e315a-da17-4b1a-96a1-fc363bf1cbff';

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
}

export default UserController;
