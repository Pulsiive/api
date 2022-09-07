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
          hours: true
        }
      },
      comments: true,
      coordinates: true
    }
  });
  return userStations.find((station: Station) => station.id === stationId);
};

class PrivateStationService {
  static async create(props: PrivateStationProperties, userId: string): Promise<StationAndPayload> {
    try {
      const stationsPropertiesWithoutHours = {
        ...props.properties,
        isPublic: false,
        nbChargingPoints: 1,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId])
      };
      const stationHours = props.properties.hours.map(
        (hour: { day: number; openTime: number; closeTime: number }) => ({
          ...hour,
          openTime: new Date(hour.openTime),
          closeTime: new Date(hour.closeTime)
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
              ...stationsPropertiesWithoutHours,
              hours: {
                create: stationHours
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              hours: true
            }
          },
          comments: true
        }
      });
      return createdStation;
    } catch (e) {
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

      const stationsPropertiesWithoutHours = {
        ...props.properties,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId])
      };
      const stationHours = props.properties.hours.map(
        (hour: { day: number; openTime: number; closeTime: number }) => ({
          ...hour,
          openTime: new Date(hour.openTime),
          closeTime: new Date(hour.closeTime)
        })
      );
      if (station.properties) {
        await prisma.stationHours.deleteMany({
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
              ...stationsPropertiesWithoutHours,
              hours: {
                create: stationHours
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              hours: true
            }
          },
          comments: true
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
                hours: true
              }
            },
            comments: true
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
}

export default PrivateStationService;
