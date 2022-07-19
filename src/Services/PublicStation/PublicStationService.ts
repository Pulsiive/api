import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';

interface StationRatingInput {
  stationId: string;
  userId: string;
  rate: number;
  creationDate: string;
  comment?: string;
}

class PublicStationService {
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
    const rating = await prisma.stationRating.create({
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
}

export default PublicStationService;
