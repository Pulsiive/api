import prisma from '../../../../prisma/client';
import { createFakeRate, user } from '../__mocks__/PublicStationsServiceMocks';
import PublicStationService from '../PublicStationService';

let stationId: string;
let userId: string;

beforeAll(async () => {
  const { id } = await prisma.user.create({
    data: user
  });
  const station = await prisma.station.create({
    data: {
      owner: {
        connect: {
          id
        }
      }
    }
  });
  stationId = station.id;
  userId = id;
});

afterAll(async () => {
  await prisma.station.delete({
    where: {
      id: stationId
    }
  });
  await prisma.user.delete({
    where: {
      id: userId
    }
  });
});

describe('Testing the rating of a public station', () => {
  test('should throw because the station does not exist', async () => {
    const rate = createFakeRate('666', userId);
    await expect(PublicStationService.rate(rate)).rejects.toThrow('Error: Invalid station ID');
  });

  test('should update the average rate of the station', async () => {
    await PublicStationService.rate(createFakeRate(stationId, userId, 2));
    await PublicStationService.rate(createFakeRate(stationId, userId, 5));
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    expect(station?.rate).toBe(3.5);
  });

  test('should create a new rating', async () => {
    const rate = await PublicStationService.rate(createFakeRate(stationId, userId));
    expect(rate).toBeDefined();
  });

  test('should update the rating number of the station', async () => {
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    expect(station?.rateNumber).toBe(3);
  });

  test('should like the given rating', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.likeComment(fakeRate.id, userId);
    const rating = await prisma.stationRating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(1);
  });

  test('should link the liked rating to the associated user', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.likeComment(fakeRate.id, userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        likedRatings: true
      }
    });
    const likedRate = user?.likedRatings.find((rating) => rating.id === fakeRate.id);
    expect(likedRate).toBeDefined();
  });

  test('should toogle the rating from disliked to liked ', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.dislikeComment(fakeRate.id, userId);
    await PublicStationService.likeComment(fakeRate.id, userId);
    const rating = await prisma.stationRating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(1);
    expect(rating?.dislikes).toBe(0);
  });

  test('should dislike the given rating', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.dislikeComment(fakeRate.id, userId);
    const rating = await prisma.stationRating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.dislikes).toBe(1);
  });

  test('should link the disliked rating to the associated user', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.dislikeComment(fakeRate.id, userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        dislikedRatings: true
      }
    });
    const likedRate = user?.dislikedRatings.find((rating) => rating.id === fakeRate.id);
    expect(likedRate).toBeDefined();
  });

  test('should toogle the rating from liked to disliked', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.likeComment(fakeRate.id, userId);
    await PublicStationService.dislikeComment(fakeRate.id, userId);
    const rating = await prisma.stationRating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(0);
    expect(rating?.dislikes).toBe(1);
  });

  test('should throw because the rating is already liked', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.likeComment(fakeRate.id, userId);
    await expect(PublicStationService.likeComment(fakeRate.id, userId)).rejects.toThrow(
      'Error: User already liked this comment'
    );
  });

  test('should throw because the rating is already disliked', async () => {
    const fakeRate = await PublicStationService.rate(createFakeRate(stationId, userId));
    await PublicStationService.dislikeComment(fakeRate.id, userId);
    await expect(PublicStationService.dislikeComment(fakeRate.id, userId)).rejects.toThrow(
      'Error: User already disliked this comment'
    );
  });

  test('should throw because the rating to like does not exist', async () => {
    await expect(PublicStationService.likeComment('666', userId)).rejects.toThrow(
      'Error: Invalid rating ID'
    );
  });

  test('should throw because the rating to dislike does not exist', async () => {
    await expect(PublicStationService.dislikeComment('666', userId)).rejects.toThrow(
      'Error: Invalid rating ID'
    );
  });
});
