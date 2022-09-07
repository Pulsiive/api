import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import StationService from '../Services/Station/StationService';

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
}

export default StationController;
