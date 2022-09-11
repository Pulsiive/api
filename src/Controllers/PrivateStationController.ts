import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import PrivateStationService from '../Services/PrivateStation/PrivateStationService';

class PrivateStationController {
  static async create(req: express.Request, res: express.Response) {
    try {
      const stationsProperties = req.body.station;
      const userId = req.body.user.payload.id;
      const station = await PrivateStationService.create(stationsProperties, userId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async update(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const stationsProperties = req.body.station;
      const userId = req.body.user.payload.id;
      const station = await PrivateStationService.update(stationsProperties, userId, stationId);
      return res.json({ station });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async delete(req: express.Request, res: express.Response) {
    try {
      const stationId = req.params.id;
      const userId = req.body.user.payload.id;

      const deletedStation = await PrivateStationService.delete(stationId, userId);
      return res.json({ deletedStation });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default PrivateStationController;
