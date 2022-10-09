import StationService from '../StationService';
import AuthService from '../../Auth/AuthService';
import UserService from '../../User/UserService';
import prisma from '../../../../prisma/client';
import { user, createFakeRate } from '../__mocks__/StationServiceMocks';

let stationId: string;
let userId: string;

beforeAll(async () => {
  await AuthService.register(user);
  const userObject = await prisma.user.findUnique({
    where: {
      email: user.email
    }
  });
  if (userObject) {
    userId = userObject.id;
    const station = await prisma.station.create({
      data: {
        owner: {
          connect: {
            id: userId
          }
        }
      }
    });
    stationId = station.id;
  }
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: user.email
    }
  });
  await prisma.$disconnect();
});

describe('Testing the station search', () => {
  test('should not return any stations because there are none in the given range', async () => {
    const stations = await StationService.getFromParams(
      {
        minPrice: 50,
        maxPrice: 200,
        userLat: 37.54246,
        userLong: 126.98621,
        plugTypes: [1]
      },
      userId
    );
    expect(stations.length).toBe(0);
  });

  test('should return stations matching the given params', async () => {
    const stations = await StationService.getFromParams(
      {
        plugTypes: [1],
        minPrice: 95,
        maxPrice: 200,
        userLat: 48.869645,
        userLong: 2.336421
      },
      userId
    );
    expect(stations.length > 0).toBe(true);
  });

  test('should throw because user has no vehicle and no plugtypes were given', async () => {
    await expect(
      StationService.getFromParams(
        {
          minPrice: 95,
          maxPrice: 200,
          userLat: 48.869645,
          userLong: 2.336421
        },
        userId
      )
    ).rejects.toThrow('Error: Please select a plug type');
  });

  test('should search the stations by using the saved plugtypes', async () => {
    const vehicle = await UserService.createVehicle(
      {
        type: 2,
        plugTypes: [1, 4],
        electricalType: 1,
        maxPower: 56.66
      },
      userId
    );
    const stations = await StationService.getFromParams(
      {
        minPrice: 95,
        maxPrice: 200,
        userLat: 48.869645,
        userLong: 2.336421
      },
      userId
    );
    expect(stations.length > 0).toBe(true);
    await prisma.vehicle.delete({
      where: {
        id: vehicle.id
      }
    });
  });
});

describe('Testing the rating of a public station', () => {
  test('should throw because the station does not exist', async () => {
    const rate = createFakeRate('666', userId);
    await expect(StationService.rate(rate)).rejects.toThrow('Error: Invalid station ID');
  });

  test('should update the average rate of the station', async () => {
    await StationService.rate(createFakeRate(stationId, userId, 2));
    await StationService.rate(createFakeRate(stationId, userId, 5));
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    expect(station?.rate).toBe(3.5);
  });

  test('should create a new rating', async () => {
    const rate = await StationService.rate(createFakeRate(stationId, userId));
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
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.likeComment(fakeRate.id, userId);
    const rating = await prisma.rating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(1);
  });

  test('should link the liked rating to the associated user', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    console.log(fakeRate);
    await StationService.likeComment(fakeRate.id, userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        likedRatings: true
      }
    });
    console.log(user);
    const likedRate = user?.likedRatings.find((rating) => rating.id === fakeRate.id);
    expect(likedRate).toBeDefined();
  });

  test('should toogle the rating from disliked to liked ', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.dislikeComment(fakeRate.id, userId);
    await StationService.likeComment(fakeRate.id, userId);
    const rating = await prisma.rating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(1);
    expect(rating?.dislikes).toBe(0);
  });

  test('should dislike the given rating', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.dislikeComment(fakeRate.id, userId);
    const rating = await prisma.rating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.dislikes).toBe(1);
  });

  test('should link the disliked rating to the associated user', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.dislikeComment(fakeRate.id, userId);
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
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.likeComment(fakeRate.id, userId);
    await StationService.dislikeComment(fakeRate.id, userId);
    const rating = await prisma.rating.findUnique({
      where: {
        id: fakeRate.id
      }
    });
    expect(rating?.likes).toBe(0);
    expect(rating?.dislikes).toBe(1);
  });

  test('should throw because the rating is already liked', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.likeComment(fakeRate.id, userId);
    await expect(StationService.likeComment(fakeRate.id, userId)).rejects.toThrow(
      'Error: User already liked this comment'
    );
  });

  test('should throw because the rating is already disliked', async () => {
    const fakeRate = await StationService.rate(createFakeRate(stationId, userId));
    await StationService.dislikeComment(fakeRate.id, userId);
    await expect(StationService.dislikeComment(fakeRate.id, userId)).rejects.toThrow(
      'Error: User already disliked this comment'
    );
  });

  test('should throw because the rating to like does not exist', async () => {
    await expect(StationService.likeComment('666', userId)).rejects.toThrow(
      'Error: Invalid rating ID'
    );
  });

  test('should throw because the rating to dislike does not exist', async () => {
    await expect(StationService.dislikeComment('666', userId)).rejects.toThrow(
      'Error: Invalid rating ID'
    );
  });
});
