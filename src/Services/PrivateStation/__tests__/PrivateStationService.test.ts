import StationService from '../../Station/StationService';
import PrivateStationService from '../PrivateStationService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import {
  user,
  secondUser,
  station,
  stationComparisonObject,
  stationNumeroDos
} from '../__mocks__/PrivateStationMocks';

let userId: string;
let secondUserId: string;
let stationId: string;
let ratingId: string;

beforeAll(async () => {
  await AuthService.register(user);
  await AuthService.register(secondUser);
  const userObject = await prisma.user.findUnique({
    where: {
      email: user.email
    }
  });
  if (userObject) {
    userId = userObject.id;
  }
  const secondUserObject = await prisma.user.findUnique({
    where: {
      email: secondUser.email
    }
  });
  if (secondUserObject) {
    secondUserId = secondUserObject.id;
  }
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: user.email
    }
  });
  await prisma.user.delete({
    where: {
      email: secondUser.email
    }
  });
  await prisma.$disconnect();
});

describe('UserService - Station', () => {
  test('should create station', async () => {
    const createdStation = await PrivateStationService.create(station, userId);
    stationId = createdStation.id;
    expect(createdStation).toEqual(stationComparisonObject);
  });

  test('should get station', async () => {
    const stationObject = await StationService.getFromId(stationId);
    expect(stationObject).toEqual(stationComparisonObject);
  });

  test('should get all stations', async () => {
    await PrivateStationService.create(station, userId);
    const stations = await PrivateStationService.getAll(userId);
    expect(stations.length).toBe(2);
  });

  test('should throw because station does not exists', async () => {
    await expect(StationService.getFromId('666')).rejects.toThrow('Error: Invalid station ID');
  });

  test('should update station', async () => {
    const update = await PrivateStationService.update(stationNumeroDos, userId, stationId);
    expect(update.id).toEqual(stationId);
    expect(update.coordinates?.address).toEqual(stationNumeroDos.coordinates.address);
  });

  test('should throw because station does not exists', async () => {
    await expect(PrivateStationService.update(stationNumeroDos, userId, '666')).rejects.toThrow(
      'Error: Invalid station ID'
    );
  });

  test('should delete station', async () => {
    await PrivateStationService.delete(stationId, userId);
    const oldStation = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    expect(oldStation).toBeNull();
  });

  test('should throw because station does not exists', async () => {
    await expect(PrivateStationService.delete('666', userId)).rejects.toThrow(
      'Error: Invalid station ID'
    );
  });
});

describe('PrivateStationService - respond to rating', () => {
  test('should throw because rating does not exists', async () => {
    await expect(
      PrivateStationService.respondToRating(userId, {
        ratingId: '123',
        comment: 'Thank you !',
        creationDate: new Date()
      })
    ).rejects.toThrow('Error: Rating not found');
  });

  test('should throw because station does not belong to user', async () => {
    const privateStation = await PrivateStationService.create(station, userId);
    const rating = await StationService.rate({
      stationId: privateStation.id,
      userId: secondUserId,
      rate: 5,
      creationDate: '2023-09-03T12:42:23.886Z',
      comment: 'Works great !'
    });

    stationId = privateStation.id;
    ratingId = rating.id;

    await expect(
      PrivateStationService.respondToRating(secondUserId, {
        ratingId: rating.id,
        comment: 'Thank you !',
        creationDate: new Date()
      })
    ).rejects.toThrow('Error: Invalid station ID');
  });

  test('should create rating response', async () => {
    const res = await PrivateStationService.respondToRating(userId, {
      ratingId,
      comment: 'Thank you !',
      creationDate: new Date()
    });
    expect(res).toBeDefined();
    await prisma.rating.delete({
      where: {
        id: ratingId
      }
    });
    await prisma.station.delete({
      where: {
        id: stationId
      }
    });
  });
});
