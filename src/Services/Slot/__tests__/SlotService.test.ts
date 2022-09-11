import UserService from '../../User/UserService';
import SlotService from '../SlotService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import {
  station,
} from '../../User/__mocks__/UserServiceMocks';
import {user, slot, slotComparisonObject} from "../__mocks__/SlotServiceMocks";

let userId: string;
let stationId: string;
let slotId: string;

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
  const createdStation = await UserService.createStation(station, userId);
  stationId = createdStation.id;
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: user.email
    }
  });
  await prisma.$disconnect();
});

describe('SlotService - Create', () => {
  test('should create slot', async () => {
    const createdSlot = await SlotService.create(userId, stationId, slot);
    slotId = createdSlot.id;
    expect(createdSlot).toEqual(slotComparisonObject);
  });
});

//    -           __
// --           ~( @\   \
//---   _________]_[__/__>_______
//     / _____ \ <>    | _____  \
//   =\_/ __ \_\______|_/ __ \__D
// ______(__)_____________(__)____
//           vroum vroum
