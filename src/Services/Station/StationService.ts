import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import { Station } from '@prisma/client';

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
}

export default StationService;
