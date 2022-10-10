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
        },
        include: {
          reservations: true
        }
      });

      if (!slot)
        throw new ApiError('Error: reservation not found', 404);

      if ((new Date(data.from) < new Date(slot.opensAt)) || (new Date(data.to) > new Date(slot.closesAt)))
        throw new ApiError('Error: Reservation not in range of the selected slot', 422);
      for (const reservation of slot.reservations) {
        if ((new Date(reservation.from) <= new Date(data.to)) && (new Date(reservation.to) >= new Date(data.from))) {
          throw new ApiError('Error: A slot is already reserved at this time', 409);
        }
      }

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
      where: { userId }
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
