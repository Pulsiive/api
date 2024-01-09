import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import moment from "moment";
import MailService from "../MailService";
import Site from "../Site";
import UserService from "../User/UserService";
import PaymentService from "../PaymentService";

class ReservationService {
  static async create(
      userId: string,
      slotId: string
  ): Promise<any> {
      const slot = await prisma.slot.findFirst({
        where: {
          id: slotId,
        }
      });

      if (!slot)
        throw new ApiError('Error: reservation not found', 404);

      if (slot.isBooked)
        throw new ApiError('Error: This slot is already booked', 409);

    const reservations = await prisma.slot.findMany({
      where: {
        driverId: userId,
      }
    });
      for (const reservation of reservations) {
        if ((new Date(reservation.opensAt) <= new Date(slot.closesAt)) && (new Date(reservation.closesAt) >= new Date(slot.opensAt))) {
          throw new ApiError('Error: A slot is already booked at this time', 409);
        }
      }

    const createdReservation = await prisma.slot.update({
      where: { id: slotId },
      data: {
        driver: {
          connect: {
            id: userId
          }
        },
        isBooked: true,
      },
      include: {
        driver: true
      }
    });

    const user = await UserService.getProfile(userId);

    if (user?.isAlertOn) {
        await MailService.send(
            Site.doNotReplyEmail,
            user?.email,
            'Your booking is confirmed',
            { reservation: createdReservation },
            '../Resources/Mails/reservationConfirmation.handlebars'
        );
    }

    const balance = await PaymentService.storeFromBalance(userId, slotId);

    return createdReservation;
  }

  static async index(stationId: any, userId: any, date: any) {
    if (!userId && !stationId && !date)
      throw new ApiError('Error: Provide at least one param in query', 422);

    const reservations = await prisma.slot.findMany({
      where: {
        driverId: userId,
        ...(stationId && { stationProperties: {
            station: {
              ...(stationId && {id: stationId})
            }
          }}),
        ...(date && { opensAt: {
            gte: moment(date).toDate(),
            lt:  moment(date).add(1, 'day').toDate()
          } }),
      },
      include: {
        stationProperties: {
          include: {
            station: {
              include: {
                coordinates: true
              }
            }
          }
        }
      }
    });

    return reservations;
  }

  static async show(id: string, userId: string) {
    const reservation = await prisma.slot.findFirst({
      where: {
        id,
        driverId: userId
      }
    });
    if (!reservation)
      throw new ApiError('Error: reservation not found', 404);

    return reservation;
  }

  static async delete(slotId: string, userId: string) {
    const reservation = await prisma.slot.findFirst({
      where: {
        id: slotId,
        driverId: userId
      }
    });

    if (!reservation)
      throw new ApiError('Error: reservation not found', 404);

    const deletedReservation = await prisma.slot.update({
      where: { id: slotId },
      data: {
        driver: {
          disconnect: true
        },
        isBooked: false
      },
      include: {
        driver: true
      }
    });

    const user = await UserService.getProfile(userId);

    if (user?.isAlertOn) {
      await MailService.send(
          Site.doNotReplyEmail,
          user?.email,
          'Your booking is cancelled',
          { reservation: deletedReservation },
          '../Resources/Mails/cancelReservationConfirmation.handlebars'
      );
    }

    return deletedReservation;
  }
}

export default ReservationService;
