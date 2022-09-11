import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import {ApiError} from "../Errors/ApiError";
import ReservationService from "../Services/Reservation/ReservationService";
import reservationRules from "../Rules/reservationRules";

class ReservationController {
  static async create(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const {
        slotId,
        from,
        to
      } = req.body;
      const data = {
        from,
        to,
      };
      const validator = new Validator(data, reservationRules);

      if (validator.fails()) {
        console.log(validator.errors);
        throw new ApiError('Error: Unprocessable entity', 422);
      }

      const reservation = await ReservationService.create(userId, slotId, data);

      return res.json(reservation);
    } catch (e: any) {
      console.log(e);

      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slots = await ReservationService.index(userId);

      return res.json(slots);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async show(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const reservationId = req.params.id;
      const reservation = await ReservationService.show(reservationId, userId);

      return res.json(reservation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async delete(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const reservationId = req.params.id;

      const deletedReservation = await ReservationService.delete(reservationId, userId);
      return res.json(deletedReservation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default ReservationController;
