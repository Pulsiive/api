import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';
import {ApiError} from "../Errors/ApiError";
import Stripe from 'stripe';
import prisma from "../../prisma/client";

const stripe = new Stripe('sk_test_51JKmWpGB07Bddq7mX4TNUnRtPKvbE5oDS00NgpnVlYAm6W4mM8LwjWyvnhei9RfCaB1VEnQjzxtJTxLoNb3MuhwT00UZc5NodG', {
  apiVersion: '2022-11-15',
});

class PaymentService {
  static async store(paymentIntentId: string, userId: string) {
    try {

      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      //console.log(paymentIntentId);

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      await stripe.customers.create({
        email: user?.email,
        name: `${user?.firstName} ${user?.lastName}`,
        payment_method: paymentIntent.payment_method as string
      });

      await prisma.payment.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          amount: paymentIntent.amount,
          date: new Date(paymentIntent.created * 1000),
          provider: 'stripe',
          providerId: paymentIntent.id
        },
      });
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: Payment failed', 422);
    }

    return true;
  }

  static async createPaymentIntent() {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: 'eur',
        setup_future_usage: "on_session"
      });

      return {
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
      }
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: Payment intent failed', 422);
    }
  }

  static async index(userId: any) {
    const payments = await prisma.payment.findMany({
      where: {
        userId
      }
    });

    return payments;
  }
}

export default PaymentService;
