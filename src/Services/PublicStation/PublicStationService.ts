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

  static async likeComment(ratingId: string, userId: string) {
    const rating = await prisma.stationRating.findUnique({
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
    return prisma.stationRating.update({
      where: {
        id: rating.id
      },
      data: query
    });
  }

  static async dislikeComment(ratingId: string, userId: string) {
    const rating = await prisma.stationRating.findUnique({
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
    return prisma.stationRating.update({
      where: {
        id: rating.id
      },
      data: query
    });
  }
}

export default PublicStationService;
