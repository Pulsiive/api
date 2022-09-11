import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import StationService from '../Services/Station/StationService';
import Validator from 'validatorjs';

class StationController {
  static async getFromId(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const station = await StationService.getFromId(stationId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getFromParams(req: express.Request, res: express.Response) {
    try {
      const params = req.body.params;
      const userId = req.body.user.payload.id;

      const validator = new Validator(params, {
        minPrice: `required|numeric`,
        maxPrice: `required|numeric`,
        plugTypes: `array|numeric`,
        range: `numeric|min:500|max:5000`,
        type: `numeric|min:0|max:1`,
        userLat: `required|numeric`,
        userLong: `required|numeric`
      });
      if (validator.fails()) {
        res.status(400).json({ message: 'Invalid parameters' });
      }

      const stations = await StationService.getFromParams(params, userId);
      return res.json({ stations });
    } catch (e: any) {
      console.log(e);
      return errorWrapper(e, res);
    }
  }
}

export default StationController;
