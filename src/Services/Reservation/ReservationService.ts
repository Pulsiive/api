import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import moment from "moment";

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
        isBooked: true
      }
    });

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
      }
    });

    return deletedReservation;
  }
}

export default ReservationService;
