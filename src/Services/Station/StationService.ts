import { getDistance } from 'geolib';
import { Station, PlugType } from '@prisma/client';

import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import { GetStationFromParams, PlugTypes } from '../../Utils/types';

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
          comments: true
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
        comments: true
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
}

export default StationService;
