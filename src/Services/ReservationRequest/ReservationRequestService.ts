import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import ReservationService from '../Reservation/ReservationService';

interface CreateReservationRequest {
  driverId: string;
  slotId: string;
  price: number;
}

class ReservationRequestService {
  static async getAllAsOwner(userId: string) {
    return await prisma.reservationRequest.findMany({
      where: {
        slot: {
          stationProperties: {
            station: {
              ownerId: userId
            }
          }
        },
        isPending: true
      },
      include: {
        driver: {
          select: {
            firstName: true,
            lastName: true,
            profilePictureId: true,
            receivedRatings: {
              select: {
                rate: true
              }
            }
          }
        },
        slot: true
      }
    });
  }

  static async getAllAsDriver(userId: string) {
    return await prisma.reservationRequest.findMany({
      where: {
        driverId: userId,
        isPending: true
      }
    });
  }

  static async create(data: CreateReservationRequest) {
    // only drivers can create ofc
    const slot = await prisma.slot.findUnique({
      where: {
        id: data.slotId
      }
    });
    if (!slot) {
      throw new ApiError('Error: Associated slot not found', 404);
    }
    if (new Date().getTime() > new Date(slot.opensAt).getTime()) {
      throw new ApiError('Error: Slot date is already passed', 500);
    }
    if (slot.isBooked) {
      throw new ApiError('Error: Slot is already booked', 404);
    }
    return await prisma.reservationRequest.create({
      data: {
        driver: {
          connect: {
            id: data.driverId
          }
        },
        slot: {
          connect: {
            id: data.slotId
          }
        },
        price: data.price
      },
      include: {
        slot: {
          include: {
            stationProperties: {
              include: {
                station: true
              }
            }
          }
        },
        driver: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  static async updateStatus(id: string, ownerId: string, isAccepted: boolean) {
    const r = await prisma.reservationRequest.findUnique({
      where: {
        id
      },
      include: {
        slot: {
          include: {
            stationProperties: {
              include: {
                station: true
              }
            }
          }
        }
      }
    });
    if (!r) {
      throw new ApiError('Error: Reservation request not found', 404);
    }
    const stationOwnerId = r.slot.stationProperties.station.ownerId;
    if (stationOwnerId !== ownerId) {
      throw new ApiError('Error: Invalid ID', 500);
    }

    if (new Date().getTime() > new Date(r.slot.opensAt).getTime()) {
      throw new ApiError('Error: Slot date is already passed', 500);
    }
    const updatedRequest = await prisma.reservationRequest.update({
      where: {
        id
      },
      data: {
        isPending: false,
        isAccepted
      }
    });
    if (isAccepted) {
      return await ReservationService.create(r.driverId, r.slotId);
    } else return updatedRequest;
  }

  static async delete(id: string, userId: string) {
    const r = await prisma.reservationRequest.findUnique({
      where: {
        id
      }
    });

    if (!r) {
      throw new ApiError('Error: Reservation request not found', 404);
    }
    if (r.driverId !== userId) {
      throw new ApiError('Error: Invalid ID', 500);
    }
    //only drivers can delete - owner will just refuse
    return await prisma.reservationRequest.delete({
      where: {
        id
      }
    });
  }
}

export default ReservationRequestService;
