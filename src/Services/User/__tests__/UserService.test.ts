import UserService from '../UserService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import {
  user,
  vehicle,
  vehicleNumeroDos,
  vehicleDBFormat,
  vehicleNumeroDosDBFormat,
  station,
  stationComparisonObject,
  stationNumeroDos
} from '../__mocks__/UserServiceMocks';

let userId: string;
let vehicleId: string;
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

describe('UserService - Vehicle', () => {
  test('should create vehicle', async () => {
    const createdVehicle = await UserService.createVehicle(vehicle, userId);
    vehicleId = createdVehicle.id;
    expect(createdVehicle).toEqual({
      ...vehicleDBFormat,
      id: expect.any(String),
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should return vehicle', async () => {
    const vehicle = await UserService.getVehicle(vehicleId, userId);
    expect(vehicle).toEqual({
      ...vehicleDBFormat,
      id: vehicleId,
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.getVehicle('666', userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });

  test('should update vehicle', async () => {
    const update = await UserService.updateVehicle(vehicleId, vehicleNumeroDos, userId);
    expect(update).toEqual({
      ...vehicleNumeroDosDBFormat,
      id: vehicleId,
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.updateVehicle('666', vehicleNumeroDos, userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });

  test('should delete vehicle', async () => {
    await UserService.deleteVehicle(vehicleId, userId);
    const nissanR34 = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId
      }
    });
    expect(nissanR34).toBeNull();
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.deleteVehicle('666', userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });
});

describe('UserService - Station', () => {
  test('sould create station', async () => {
    const createdStation = await UserService.createStation(station, userId);
    stationId = createdStation.id;
    expect(createdStation).toEqual(stationComparisonObject);
  });

  test('sould get station', async () => {
    const stationObject = await UserService.getStation(stationId);
    expect(stationObject).toEqual(stationComparisonObject);
  });

  test('should throw because station does not exists', async () => {
    await expect(UserService.getStation('666')).rejects.toThrow('Error: Invalid station ID');
  });

  test('should update station', async () => {
    const update = await UserService.updateStation(stationNumeroDos, userId, stationId);
    expect(update.id).toEqual(stationId);
    expect(update.coordinates?.address).toEqual(stationNumeroDos.coordinates.address);
  });

  test('should throw because station does not exists', async () => {
    await expect(UserService.updateStation(stationNumeroDos, userId, '666')).rejects.toThrow(
      'Error: Invalid station ID'
    );
  });

  test('should delete station', async () => {
    await UserService.deleteStation(stationId, userId);
    const oldStation = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    expect(oldStation).toBeNull();
  });

  test('should throw because station does not exists', async () => {
    await expect(UserService.deleteStation('666', userId)).rejects.toThrow(
      'Error: Invalid station ID'
    );
  });
});

//    -           __
// --           ~( @\   \
//---   _________]_[__/__>_______
//     / _____ \ <>    | _____  \
//   =\_/ __ \_\______|_/ __ \__D
// ______(__)_____________(__)____
//           vroum vroum
