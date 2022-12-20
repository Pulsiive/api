import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import StationService from '../Services/Station/StationService';
import Validator from 'validatorjs';
import { ApiError } from '../Errors/ApiError';

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

  static async getAll(req: express.Request, res: express.Response) {
    try {
      const stations = await StationService.getAll();
      return res.json({ stations });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async rate(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const rateInput = req.body.rating;
      const validation = new Validator(rateInput, {
        id: 'required|string',
        rate: 'required|min:1|max:5',
        date: 'required|date',
        comment: 'string|min:2|max:300'
      });
      if (validation.fails()) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      const rate = await StationService.rate({
        stationId: rateInput.id,
        userId,
        rate: rateInput.rate,
        creationDate: rateInput.date,
        comment: rateInput.comment
      });
      return res.json({ rate });
    } catch (e) {
      console.log(e);
      return errorWrapper(e, res);
    }
  }

  static async attachPicturesToRating(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const pictures = req.files;

      if (!pictures) {
        throw new ApiError('Error: Please provide one or more picture', 400);
      }
      const uploadResponses = await StationService.attachPicturesToRating(
        pictures,
        req.body.commentId,
        userId
      );
      res.json({ uploads: uploadResponses });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async likeComment(req: express.Request, res: express.Response) {
    try {
      const ratingId = req.params.id;
      const userId = req.body.user.payload.id;

      const updatedRating = await StationService.likeComment(ratingId, userId);
      return res.json({ rate: updatedRating });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async dislikeComment(req: express.Request, res: express.Response) {
    try {
      const ratingId = req.params.id;
      const userId = req.body.user.payload.id;

      const updatedRating = await StationService.dislikeComment(ratingId, userId);
      return res.json({ rate: updatedRating });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }
}

export default StationController;
