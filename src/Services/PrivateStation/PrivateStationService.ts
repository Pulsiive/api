import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import { PlugTypes, PrivateStationProperties, StationAndPayload } from '../../Utils/types';
import { Station } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';

const getUserStation = async (
  userId: string,
  stationId: string
): Promise<undefined | StationAndPayload> => {
  const userStations = await prisma.station.findMany({
    where: {
      ownerId: userId
    },
    include: {
      properties: {
        include: {
          slots: true
        }
      },
      rates: true,
      coordinates: true
    }
  });
  return userStations.find((station: Station) => station.id === stationId);
};

class PrivateStationService {
  static async create(props: PrivateStationProperties, userId: string): Promise<StationAndPayload> {
    try {
      const stationsPropertiesWithoutSlots = {
        ...props.properties,
        isPublic: false,
        nbChargingPoints: 1,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId]),
        slots: null
      };

      const slots = props.properties.slots.map(
        (slot: { day: number; opensAt: string; closesAt: string }) => ({
          day: slot.day,
          opensAt: slot.opensAt,
          closesAt: slot.closesAt
        })
      );

      const createdStation = await prisma.station.create({
        data: {
          owner: {
            connect: {
              id: userId
            }
          },
          coordinates: {
            create: props.coordinates
          },
          properties: {
            create: {
              ...stationsPropertiesWithoutSlots,
              slots: {
                create: slots
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              slots: true
            }
          },
          rates: true
        }
      });
      return createdStation;
    } catch (e) {
      console.log(e);
      if (e instanceof PrismaClientValidationError) {
        throw new ApiError('Error: Invalid properties');
      }
      throw new ApiError('Error: Failed to create a private station');
    }
  }

  static async update(
    props: PrivateStationProperties,
    userId: string,
    stationId: string
  ): Promise<StationAndPayload> {
    try {
      //TODO: improve this - don't delete current hours

      const station = await getUserStation(userId, stationId);

      if (!station) throw new ApiError('Error: Invalid station ID');

      const stationsPropertiesWithoutSlots = {
        ...props.properties,
        isPublic: false,
        nbChargingPoints: 1,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId])
      };
      const slots = props.properties.slots.map(
        (slot: { day: number; opensAt: string; closesAt: string }) => ({
          day: slot.day,
          opensAt: slot.opensAt,
          closesAt: slot.closesAt
        })
      );
      if (station.properties) {
        await prisma.slot.deleteMany({
          where: {
            stationPropertiesId: station.properties.id
          }
        });
      }
      const updatedStation = await prisma.station.update({
        where: {
          id: stationId
        },
        data: {
          coordinates: {
            update: props.coordinates
          },
          properties: {
            update: {
              ...stationsPropertiesWithoutSlots,
              slots: {
                create: slots
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              slots: true
            }
          },
          rates: true
        }
      });
      return updatedStation;
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Failed to create a private station');
    }
  }

  static async delete(stationId: string, userId: string): Promise<StationAndPayload> {
    try {
      const station = await getUserStation(userId, stationId);
      if (station) {
        const deletedStation = await prisma.station.delete({
          where: {
            id: stationId
          },
          include: {
            coordinates: true,
            properties: {
              include: {
                slots: true
              }
            },
            rates: true
          }
        });
        return deletedStation;
      }
      throw new ApiError('Error: Invalid station ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Station deletion failed');
    }
  }

  static async get(stationId: string): Promise<Station> {
    try {
      const station = await prisma.station.findUnique({
        where: {
          id: stationId
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              slots: true
            }
          },
          rates: true
        }
      });
      if (station) {
        return station;
      }
      throw new ApiError('Error: Invalid station ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Invalid station ID');
    }
  }
}

export default PrivateStationService;
