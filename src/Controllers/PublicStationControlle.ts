import express from 'express';
import Validator from 'validatorjs';
import { errorWrapper } from '../Utils/errorWrapper';
import PublicStationService from '../Services/PublicStation/PublicStationService';

class PublicStationController {
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
      const rate = await PublicStationService.rate({
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
}

export default PublicStationController;
