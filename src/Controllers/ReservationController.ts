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
      const slotId = req.params.slotId;

      const reservation = await ReservationService.create(userId, slotId);

      return res.json(reservation);
    } catch (e: any) {
      console.log(e);

      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const stationId = req.query.station_id ?? null;

      const date = req.query.date ?? null;
      const slots = await ReservationService.index(stationId, userId, date);

      return res.json(slots);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async show(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const reservationId = req.params.slotId;
      const reservation = await ReservationService.show(reservationId, userId);

      return res.json(reservation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async delete(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const reservationId = req.params.slotId;

      const deletedReservation = await ReservationService.delete(reservationId, userId);
      return res.json(deletedReservation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default ReservationController;
