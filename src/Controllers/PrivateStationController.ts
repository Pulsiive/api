import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import PrivateStationService from '../Services/PrivateStation/PrivateStationService';
import Validator from 'validatorjs';

class PrivateStationController {
  static async getAll(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;

      const stations = await PrivateStationService.getAll(userId);
      return res.json({ stations });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async getAllFromUser(req: express.Request, res: express.Response) {
    try {
      const requestedUserId = req.params.id;

      const stations = await PrivateStationService.getAll(requestedUserId);
      return res.json({ stations });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

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

  static async respondToRating(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const data = req.body.response;

      const validator = new Validator(data, {
        ratingId: `required|string`,
        comment: `required|string|min:2|max:300`,
        creationDate: 'required|date'
      });
      if (validator.fails()) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      const newResponse = await PrivateStationService.respondToRating(userId, data);
      return res.json({ response: newResponse });
    } catch (e: any) {
      console.log(e);
      return errorWrapper(e, res);
    }
  }
}

export default PrivateStationController;
