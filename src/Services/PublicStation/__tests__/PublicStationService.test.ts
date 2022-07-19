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
});
