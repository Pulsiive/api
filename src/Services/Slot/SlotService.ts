import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';

class SlotService {
  static async create(
      userId: string,
      stationId: string,
      data: {day: number, opensAt: string, closesAt: string},
  ): Promise<any> {
      const station = await prisma.station.findFirst({
        where: {
          id: stationId,
          ownerId: userId
        },
        select: {
          properties: {
            select: {
              id: true
            }
          },
        }
      });

      if (!station || !station.properties)
        throw new ApiError('Error: Station with properties not found', 404);

      const createdSlot = await prisma.slot.create({
        data: {
          stationProperties: {
            connect: {
              id: station.properties.id
            }
          },
          day: data.day,
          opensAt: data.opensAt,
          closesAt: data.closesAt
        }
      });

      return createdSlot;
  }

  static async update(
      slotId: string,
      data: {day: number, opensAt: string, closesAt: string},
  ): Promise<any> {
    const slot = await prisma.slot.update({
      where: { id: slotId },
      data: {
        ...(data.day && { day: data.day }),
        ...(data.opensAt && { opensAt: new Date(data.opensAt) }),
        ...(data.closesAt && { closesAt: new Date(data.closesAt) }),
      }
    });

    return slot;
  }

  static async index(
      userId: string
  ) {
    const slots = await prisma.slot.findMany({
      where: {
        stationProperties: {
          station: {
            ownerId: userId
          }
        },
      },
      include: {
        stationProperties: true
      }
    });

    return slots;
  }

  static async show(id: string, userId: string) {
    const slot = await prisma.slot.findFirst({
      where: {
        id,
        stationProperties: {
          station: {
            ownerId: userId
          }
        },
      },
      include: {
        stationProperties: true
      }
    });
    if (!slot) {
      throw new ApiError('Error: slot ID not found', 404);
    }

    return slot;
  }

  static async delete(id: string, userId: string) {
    const slot = await prisma.slot.findFirst({
      where: {
        id,
        stationProperties: {
          station: {
            ownerId: userId
          }
        },
      },
      include: {
        stationProperties: true
      }
    });

    if (!slot) {
      throw new ApiError('Error: slot ID not found', 404);
    }

    await prisma.slot.delete({
      where: {
        id: slot.id
      }
    });

    return slot;
  }
}

export default SlotService;
