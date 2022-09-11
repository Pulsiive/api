import StationService from '../../Station/StationService';
import PrivateStationService from '../PrivateStationService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import {
  user,
  station,
  stationComparisonObject,
  stationNumeroDos
} from '../__mocks__/PrivateStationMocks';

let userId: string;
let stationId: string;

beforeAll(async () => {
  await AuthService.register(user);
  const userObject = await prisma.user.findUnique({
    where: {
      email: user.email
    }
  });
  if (userObject) {
    userId = userObject.id;
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

describe('UserService - Station', () => {
  test('sould create station', async () => {
    const createdStation = await PrivateStationService.create(station, userId);
    stationId = createdStation.id;
    expect(createdStation).toEqual(stationComparisonObject);
  });

  test('sould get station', async () => {
    const stationObject = await StationService.getFromId(stationId);
    expect(stationObject).toEqual(stationComparisonObject);
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
