import express from 'express';
import AuthService from '../Services/Auth/AuthService';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import PaymentService from "../Services/PaymentService";

class PaymentController {
  static async store(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const paymentIntentId = req.body.payment_intent_id;

      const validator = new Validator({paymentIntentId}, {
        paymentIntentId: `required|string`,
      });

      if (validator.fails()) {
        return res.status(422).json({ message: 'Error: Payment failed' });
      }

      await PaymentService.store(paymentIntentId, userId);

      return res.json({
        success: true
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async storeFromBalance(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const slotId = req.body.slot_id as any;

      const balance = await PaymentService.storeFromBalance(userId, slotId);

      return res.json({
        balance
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async topUpBalance(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const brutPrice = req.body.brut_price;

      const balance = await PaymentService.topUpBalance(userId, brutPrice);

      return res.json({
        balance
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async createPaymentIntent(req: express.Request, res: express.Response) {
    try {
      const data = await PaymentService.createPaymentIntent(req.body.brut_price);

      return res.json({
        client_secret: data.client_secret,
        id: data.id
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async updatePaymentIntent(req: express.Request, res: express.Response) {
    try {
      const data = await PaymentService.updatePaymentIntent(req.body.payment_intent_id, req.body.brut_price);

      return res.json({
        id: data.id
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    let userId = null;

    try {
      userId = req.body?.user?.payload?.id ?? null;
      const payments = await PaymentService.index(userId);

      return res.json(payments);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default PaymentController;
