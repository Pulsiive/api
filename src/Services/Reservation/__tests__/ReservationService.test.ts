import UserService from '../../User/UserService';
import SlotService from '../../Slot/SlotService';
import ReservationService from '../../Reservation/ReservationService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import { station } from '../../User/__mocks__/UserServiceMocks';
import { slot } from '../../Slot/__mocks__/SlotServiceMocks';

import {
  user,
  owner,
  reservation,
  reservationComparisonObject,
  reservationShowComparisonObject,
  reservationDeletedComparisonObject
} from "../__mocks__/ReservationServiceMocks";

let userId: string;
let ownerId: string;
let stationId: string;
let slotId: string;
let reservationId: string;

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

  await AuthService.register(owner);

  const ownerObject = await prisma.user.findUnique({
    where: {
      email: owner.email
    }
  });
  if (ownerObject) {
    ownerId = ownerObject.id;
  }

  const createdStation = await UserService.createStation(station, ownerId);
  stationId = createdStation.id;
  const createdSlot = await SlotService.create(ownerId, stationId, slot);
  slotId = createdSlot.id;
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: owner.email
    }
  });

  await prisma.user.delete({
    where: {
      email: user.email
    }
  });

  await prisma.$disconnect();
});

describe('ReservationService - Create', () => {
  test('should create reservation', async () => {
    const createdReservation = await ReservationService.create(userId, slotId, reservation);
    reservationId = createdReservation.id;
    expect(createdReservation).toEqual(reservationComparisonObject);
  });
});

describe('ReservationService - Show', () => {
  test('should get one reservation', async () => {
    const reservations = await ReservationService.show(reservationId, userId);
    expect(reservations).toEqual(reservationShowComparisonObject);
  });
});

describe('ReservationService - Index', () => {
  test('should get all reservations', async () => {
    const reservations = await ReservationService.index(userId);
    expect(reservations).toEqual(expect.any(Array));
  });
});

describe('ReservationService - Delete', () => {
  test('should delete one reservation', async () => {
    const reservations = await ReservationService.delete(reservationId, userId);
    expect(reservations).toEqual(reservationDeletedComparisonObject);
  });
});

//    -           __
// --           ~( @\   \
//---   _________]_[__/__>_______
//     / _____ \ <>    | _____  \
//   =\_/ __ \_\______|_/ __ \__D
// ______(__)_____________(__)____
//           vroum vroum
