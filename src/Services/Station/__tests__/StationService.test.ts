import StationService from '../StationService';
import AuthService from '../../Auth/AuthService';
import UserService from '../../User/UserService';
import prisma from '../../../../prisma/client';
import { StationAndPayload } from '../../../Utils/types';
import { user } from '../__mocks__/StationServiceMocks';

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
