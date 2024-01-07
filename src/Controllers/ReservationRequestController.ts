import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import ReservationRequestService from '../Services/ReservationRequest/ReservationRequestService';
import NotificationService from '../Services/Notification/NotificationService';

class ReservationRequestController {
  static async getAllAsOwner(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const r = await ReservationRequestService.getAllAsOwner(userId);

      return res.json(r);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async getAllAsDriver(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const r = await ReservationRequestService.getAllAsDriver(userId);

      return res.json(r);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async create(req: express.Request, res: express.Response) {
    try {
      const validator = new Validator(req.body, {
        slotId: 'required|string',
        price: 'required|numeric'
      });

      if (validator.fails()) {
        return res.status(422).json({ message: 'Error: Invalid input' });
      }
      const driverId = req.body.user.payload.id;
      const r = await ReservationRequestService.create({ driverId, ...req.body });
      res.json(r);

      try {
        const stationOwnerId = r.slot.stationProperties.station.ownerId;
        if (stationOwnerId) {
          const notificationData = {
            title: 'New reservation request !',
            body: `${r.driver.firstName} ${r.driver.lastName} wants to rent your station. You will earn ${r.price / 100} €`
          };
          await NotificationService.sendNotification(stationOwnerId, notificationData, {
            redirect: 'ReservationRequests'
          });
        }
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async updateStatus(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const userObject = req.body.user.payload;

      const validator = new Validator(req.body, {
        isAccepted: 'required|boolean'
      });

      if (validator.fails()) {
        return res.status(422).json({ message: 'Error: Invalid input' });
      }

      const reservationRequest = await ReservationRequestService.updateStatus(
        req.params.id,
        userId,
        req.body.isAccepted
      );

      const notificationMessage = `${userObject.firstName} ${userObject.lastName} ${
        req.body.isAccepted ? 'accepted' : 'refused'
      } your reservation request!`;
      try {
        await NotificationService.sendNotification(reservationRequest.driverId, {
          title: 'Reservation',
          body: notificationMessage
        });
      } catch (e) {
        console.log(e);
      }

      return res.json(reservationRequest);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async delete(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const r = await ReservationRequestService.delete(req.params.id, userId);

      return res.json(r);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }
}

export default ReservationRequestController;
