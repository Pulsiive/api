import { getDistance } from 'geolib';
import { Station, PlugType } from '@prisma/client';

import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import { GetStationFromParams, PlugTypes, StationRatingInput } from '../../Utils/types';

class StationService {
  // will fetch public OR private station from given ID
  static async getFromId(stationId: string): Promise<Station> {
    try {
      const station = await prisma.station.findUnique({
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

  static async getFromParams(params: GetStationFromParams, userId: string): Promise<Station[]> {
    let plugTypes: Array<PlugType> = [];
    if (!params.plugTypes) {
      const userVehicle = await prisma.vehicle.findMany({
        where: {
          ownerId: userId
        }
      });
      if (userVehicle.length === 0) {
        throw new ApiError('Error: Please select a plug type', 400);
      }
      plugTypes = userVehicle.map(({ plugTypes }) => plugTypes).flat();
    } else plugTypes = params.plugTypes.map((plugTypeId) => PlugTypes[plugTypeId]);

    const stations = await prisma.station.findMany({
      where: {
        properties: {
          price: {
            gt: params.minPrice,
            lt: params.maxPrice
          },
          isPublic: params.type ? params.type === 0 : undefined,
          plugTypes: {
            hasSome: plugTypes
          }
        }
      },
      include: {
        coordinates: true,
        properties: true,
        rates: true
      }
    });

    const inRangeStations: Station[] = [];
    const range = params.range ?? 2000; //2km by default
    for (const station of stations) {
      if (station.coordinates) {
        const distance = getDistance(
          { latitude: params.userLat, longitude: params.userLong },
          {
            latitude: parseFloat(station.coordinates.lat.toString()),
            longitude: parseFloat(station.coordinates.long.toString())
            //converting decimal to float
          }
        );
        if (distance <= range) {
          inRangeStations.push(station);
        }
      }
    }
    return inRangeStations;
  }

  static async rate({ stationId, userId, rate, creationDate, comment }: StationRatingInput) {
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      },
      include: {
        rates: true
      }
    });
    if (!station) {
      throw new ApiError('Error: Invalid station ID', 404);
    }
    const newStationScore =
      (station.rates.reduce((previous, current) => previous + current.rate, 0) + rate) /
      (station.rateNumber + 1);
    const rating = await prisma.rating.create({
      data: {
        station: {
          connect: {
            id: station.id
          }
        },
        author: {
          connect: {
            id: userId
          }
        },
        rate,
        comment,
        date: creationDate
      }
    });
    await prisma.station.update({
      where: {
        id: station.id
      },
      data: {
        rate: parseFloat(newStationScore.toPrecision(2)),
        rateNumber: station.rateNumber + 1,
        rates: {
          connect: {
            id: rating.id
          }
        }
      }
    });
    return rating;
  }

  static async likeComment(ratingId: string, userId: string) {
    const rating = await prisma.rating.findUnique({
      where: {
        id: ratingId
      },
      include: {
        likedBy: true,
        dislikedBy: true
      }
    });
    if (!rating) {
      throw new ApiError('Error: Invalid rating ID', 404);
    }
    if (rating.likedBy.find((user) => user.id === userId) !== undefined) {
      throw new ApiError('Error: User already liked this comment', 400);
    }

    let query: object = {
      likes: rating.likes + 1,
      likedBy: {
        connect: {
          id: userId
        }
      }
    };
    if (rating.dislikedBy.find((user) => user.id === userId) !== undefined) {
      query = {
        ...query,
        dislikes: rating.dislikes - 1,
        dislikedBy: {
          disconnect: {
            id: userId
          }
        }
      };
    }
    return prisma.rating.update({
      where: {
        id: rating.id
      },
      data: query
    });
  }

  static async dislikeComment(ratingId: string, userId: string) {
    const rating = await prisma.rating.findUnique({
      where: {
        id: ratingId
      },
      include: {
        likedBy: true,
        dislikedBy: true
      }
    });
    if (!rating) {
      throw new ApiError('Error: Invalid rating ID', 404);
    }

    if (rating.dislikedBy.find((user) => user.id === userId) !== undefined) {
      throw new ApiError('Error: User already disliked this comment', 400);
    }

    let query: object = {
      dislikes: rating.dislikes + 1,
      dislikedBy: {
        connect: {
          id: userId
        }
      }
    };
    if (rating.likedBy.find((user) => user.id === userId) !== undefined) {
      query = {
        ...query,
        likes: rating.likes - 1,
        likedBy: {
          disconnect: {
            id: userId
          }
        }
      };
    }
    return prisma.rating.update({
      where: {
        id: rating.id
      },
      data: query
    });
  }
}

export default StationService;
