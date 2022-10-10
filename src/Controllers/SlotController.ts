import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import slotRules from "../Rules/slotRules";
import {ApiError} from "../Errors/ApiError";
import SlotService from "../Services/Slot/SlotService";
import updateSlotRules from "../Rules/updateSlotRules";

class SlotController {
  static async create(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const {
        stationId,
        day,
        opensAt,
        closesAt,
      } = req.body;
      const data = {
        day,
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
        day,
        opensAt,
        closesAt,
      } = req.body;

      const data = {
        day,
        opensAt,
        closesAt
      };

      const validator = new Validator(data, updateSlotRules);

      if (validator.fails())
        throw new ApiError('Error: [Unprocessable entity]: Bad slot update payload', 422);

      if (new Date(data.opensAt) >= new Date(data.closesAt))
        throw new ApiError('Error: [Unprocessable entity]: opensAt dateTime needs to be before closesAt dateTime', 422);

      let slot = await prisma.slot.findFirst({
        where: {
          id: slotId,
          stationProperties: {
            station: {
              ownerId: userId
            }
          }
        },
      });

      if (!slot)
        throw new ApiError('Error: Slot not found', 404);

      //Check if slot w/ same day & hours + actual owner exist
      slot = await prisma.slot.findFirst({
        where: {
          stationProperties: {
            station: {
              ownerId: userId
            }
          },
          day: data.day,
          opensAt: {
            gte: new Date(data.opensAt)
          },
          closesAt: {
            lte: new Date(data.closesAt)
          }
        },
      });

      if (slot)
        throw new ApiError('Error: Slot already exist', 409);

      const state = await SlotService.update(slotId, data);

      return res.json(state);
    } catch (e: any) {
      console.log(e);

      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slots = await SlotService.index(userId);

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
