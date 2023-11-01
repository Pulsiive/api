import NotificationService from '../Services/Notification/NotificationService';
import express from 'express';
import Validator from 'validatorjs';
import { errorWrapper } from '../Utils/errorWrapper';

class NotificationController {
  static async send(req: express.Request, res: express.Response) {
    try {
      const validator = new Validator(req.body, {
        userId: `string|required`,
        title: `string|required|min:5|max:35`,
        body: `string|min:5|max: 70`
      });
      if (validator.fails()) {
        return res.status(422).json({ message: 'Error: Invalid input' });
      }

      await NotificationService.sendNotification(req.body.userId, {
        title: req.body.title,
        body: req.body.body
      });
      res.json({ message: 'ok' });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }
}

export default NotificationController;
