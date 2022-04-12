import express from 'express';
import UserService from '../Services/UserService';
import { VehicleInput } from '../Utils/types';
import { errorWrapper } from '../Utils/errorWrapper';

class UserController {
  static async getVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const vehicule = await UserService.getVehicle(vehicleId, userId);
      return res.json({ vehicule });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicle: VehicleInput = req.body.vehicle;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const createdVehicule = await UserService.createVehicle(vehicle, userId);
      return res.json({ createdVehicule });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const vehicleConfig = req.body.vehicle;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const createdVehicule = await UserService.updateVehicle(vehicleId, vehicleConfig, userId);
      return res.json({ createdVehicule });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = '12734e5f-2d24-491c-acaf-52310ed9188f';

      const deletedVehicule = await UserService.deleteVehicle(vehicleId, userId);
      return res.json({ deletedVehicule });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default UserController;
