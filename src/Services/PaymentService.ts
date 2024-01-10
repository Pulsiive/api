import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import moment from 'moment';
import {ApiError} from "../Errors/ApiError";
import Stripe from 'stripe';
import prisma from "../../prisma/client";
import SlotService from "./Slot/SlotService";

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

      const balance = await PaymentService.topUpBalance(userId, paymentIntent.amount);
      console.log(balance);
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: Payment failed', 422);
    }

    return true;
  }

  static async createPaymentIntent(brutPrice: any) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: brutPrice,
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

  static async updatePaymentIntent(paymentIntentId: string, brutPrice: any) {
    try {
      const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: brutPrice
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

  static async storeFromBalance(userId: string, slotId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      const slot = await prisma.slot.findUnique({
        where: {
          id: slotId
        },
        include: {
          stationProperties: {
            include: {
              station: {
                include: {
                  owner: true
                }
              }
            }
          }
        }
      }) as any;

      const brutPrice = SlotService.getBrutPrice(slot);

      const owner = slot?.stationProperties.station.owner;

      if (!user || (user?.balance - brutPrice < 0))
        throw new ApiError('Error: Insufficient balance', 422);

      const updatedUser = await prisma.user.update({
        where: {id: userId},
        data: {balance: user?.balance - brutPrice}
      });

      const updatedOwner = await prisma.user.update({
        where: {id: owner?.id},
        data: {balance: owner?.balance + brutPrice}
      });

      await prisma.payment.create({
        data: {
          user: {
            connect: {
              id: owner?.id
            }
          },
          slot: {
            connect: {
              id: slot?.id
            }
          },
          amount: brutPrice,
          date: new Date(),
          transaction_type: 'debit',
          provider: 'balance',
        },
      });

      return updatedUser.balance;
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: Payment failed', 422);
    }

    return true;
  }

  static async revertBalance(userId: string, slotId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      }) as any;

      const slot = await prisma.slot.findUnique({
        where: {
          id: slotId
        },
        include: {
          stationProperties: {
            include: {
              station: {
                include: {
                  owner: true
                }
              }
            }
          }
        }
      }) as any;

      const brutPrice = SlotService.getBrutPrice(slot);

      await prisma.payment.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          slot: {
            connect: {
              id: slot?.id
            }
          },
          amount: brutPrice,
          date: new Date(),
          transaction_type: 'debit',
          provider: 'balance',
        },
      });

      const updatedUser = await prisma.user.update({
        where: {id: userId},
        data: {balance: user?.balance + brutPrice}
      });

      return updatedUser.balance;
    } catch (e) {
      throw new ApiError('Error: Refund failed', 422);
    }

    return true;
  }

  static async topUpBalance(userId: string, brutPrice: number) {
    try {
      const userToTopUp = await prisma.user.findUnique({where: {id: userId}});

      if (!userToTopUp)
        throw new ApiError('Error: User not found', 404);

        const updatedUser = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            balance: userToTopUp?.balance + brutPrice
          }
        });

      return updatedUser.balance;
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: Payment failed', 422);
    }

    return true;
  }
}

export default PaymentService;
