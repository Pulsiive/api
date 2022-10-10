import UserService from '../../User/UserService';
import SlotService from '../../Slot/SlotService';
import ReservationService from '../../Reservation/ReservationService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import { station } from '../../PrivateStation/__mocks__/PrivateStationMocks';
import { slot } from '../../Slot/__mocks__/SlotServiceMocks';

import {
  user,
  owner,
  reservation,
  reservationComparisonObject,
  reservationShowComparisonObject,
  reservationDeletedComparisonObject, alreadyReservedObject
} from "../__mocks__/ReservationServiceMocks";
import {ApiError} from "../../../Errors/ApiError";
import PrivateStationService from "../../PrivateStation/PrivateStationService";

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

  const createdStation = await PrivateStationService.create(station, ownerId);
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

describe('ReservationService', () => {
  test('should create reservation', async () => {
    const createdReservation = await ReservationService.create(userId, slotId, reservation);
    reservationId = createdReservation.id;
    expect(createdReservation).toEqual(reservationComparisonObject);
  });

  test('should throw error slot already reserved', async () => {
    await expect(ReservationService.create(userId, slotId, alreadyReservedObject)).rejects.toThrow(new ApiError('Error: A slot is already reserved at this time', 409));
  });

  test('should get one reservation', async () => {
    const reservations = await ReservationService.show(reservationId, userId);
    expect(reservations).toEqual(reservationShowComparisonObject);
  });

  test('should get all reservations', async () => {
    const reservations = await ReservationService.index(userId);
    expect(reservations).toEqual(expect.any(Array));
  });

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
