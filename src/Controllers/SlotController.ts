import express from 'express';
import UserService from '../Services/User/UserService';
import {Slot, VehicleInput} from '../Utils/types';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import AuthService from '../Services/Auth/AuthService';
import updateProfileRules from '../Rules/updateProfileRules';
import slotRules from "../Rules/slotRules";
import {ApiError} from "../Errors/ApiError";
import SlotService from "../Services/Slot/SlotService";

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

      const slot = await SlotService.create(userId, stationId, data);

      return res.json(slot);
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
