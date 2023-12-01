import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import slotRules from "../Rules/slotRules";
import {ApiError} from "../Errors/ApiError";
import SlotService from "../Services/Slot/SlotService";
import updateSlotRules from "../Rules/updateSlotRules";
import moment from "moment";

class SlotController {
  static async create(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const {
        stationId,
        opensAt,
        closesAt,
      } = req.body;
      const data = {
        opensAt,
        closesAt
      };
      const validator = new Validator(data, slotRules);

      if (validator.fails())
        throw new ApiError('Error: Unprocessable entity', 422);

      if (new Date(data.opensAt) >= new Date(data.closesAt))
        throw new ApiError('Error: [Unprocessable entity]: "opensAt" dateTime needs to be before "closesAt" dateTime', 422);

      const slot = await SlotService.create(userId, stationId, data);

      return res.json(slot);
    } catch (e: any) {
      console.log(e);

      return errorWrapper(e, res);
    }
  }

  static async update(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slotId = req.params.id;
      const {
        opensAt,
        closesAt,
      } = req.body;

      const data = {
        opensAt,
        closesAt
      };

      const validator = new Validator(data, updateSlotRules);

      if (validator.fails())
        throw new ApiError('Error: [Unprocessable entity]: Bad slot update payload', 422);

      if (new Date(data.opensAt) >= new Date(data.closesAt))
        throw new ApiError('Error: [Unprocessable entity]: opensAt dateTime needs to be before closesAt dateTime', 422);

      const slot = await SlotService.update(userId, slotId, data);

      return res.json(slot);
    } catch (e: any) {
      console.log(e);

      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    let userId = null;
    let stationId = null;

    try {
        userId = req.body?.user?.payload?.id ?? null;
        stationId = req.query.station_id ?? null;

      const date = req.query.date ?? null;
      const slots = await SlotService.index(stationId, userId, date) as any;
      for (const slot of slots) {
        slot.price_per_minute = (slot.stationProperties.price/100).toFixed(2);
        const diffInMiliseconds = moment(slot.closesAt).diff(slot.opensAt);
        slot.nb_mins = diffInMiliseconds/60000;
        slot.brut_price = slot.stationProperties.price * slot.nb_mins;
        const price = slot.nb_mins * slot.price_per_minute;
        slot.price = price.toFixed(2);
      }

      console.log(slots);

      return res.json(slots);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async show(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slotId = req.params.id;
      const slot = await SlotService.show(slotId, userId);

      return res.json(slot);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async delete(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slotId = req.params.id;

      const deletedSlot = await SlotService.delete(slotId, userId);
      return res.json(deletedSlot);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default SlotController;
