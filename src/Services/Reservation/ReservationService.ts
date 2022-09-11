import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';

class ReservationService {
  static async create(
      userId: string,
      slotId: string,
      data: {from: string, to: string},
  ): Promise<any> {
      const slot = await prisma.slot.findFirst({
        where: {
          id: slotId,
        }
      });

      if (!slot)
        throw new ApiError('Error: reservation not found', 404);

      const createdReservation = await prisma.reservation.create({
        data: {
          slot: {
            connect: {
              id: slotId
            }
          },
          user: {
            connect: {
              id: userId
            }
          },
          from: data.from,
          to: data.to
        }
      });

      return createdReservation;
  }

  static async index(
      userId: string
  ) {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        slot: true
      }
    });

    return reservations;
  }

  static async show(id: string, userId: string) {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        slot: true
      }
    });
    if (!reservation)
      throw new ApiError('Error: reservation not found', 404);

    return reservation;
  }

  static async delete(id: string, userId: string) {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        slot: true
      }
    });

    if (!reservation) {
      throw new ApiError('Error: reservation ID not found', 404);
    }

    const deletedReservation = await prisma.reservation.delete({
      where: {
        id: reservation.id
      }
    });

    return deletedReservation;
  }
}

export default ReservationService;
