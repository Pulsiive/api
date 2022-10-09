import { VehicleType, PlugType, VehicleElectricalType, Prisma } from '@prisma/client';

export type StationAndPayload = Prisma.StationGetPayload<{
  include: {
    properties: {
      include: {
        hours: true;
      };
    };
    rates: true;
    coordinates: true;
  };
}>;
//See https://github.com/prisma/prisma/discussions/10928

export interface VehicleInput {
  type: number;
  plugTypes: number[];
  electricalType: number;
  maxPower: number;
}

export const VehicleTypes = [
  VehicleType.CAR,
  VehicleType.SCOOTER,
  VehicleType.MOTORBIKE,
  VehicleType.BIKE
];

export const PlugTypes = [
  PlugType.TYPE1,
  PlugType.TYPE2,
  PlugType.TYPE3,
  PlugType.CCS,
  PlugType.CHADEMO,
  PlugType.GREENUP
];

export const VehicleElectricalTypes = [
  VehicleElectricalType.BEV,
  VehicleElectricalType.HEV,
  VehicleElectricalType.PHEV
];

export interface OpeningHours {
  day: number;
  openTime: string;
  closeTime: string;
}

export interface PublicStationProperties {
  coordinates: {
    lat: number;
    long: number;
    address: string;
    city: string;
    country: string;
    countryCode: string;
  };
  properties: {
    maxPower: number;
    price: number;
    isGreenEnergy: boolean;
    plugTypes: number[];
    hours: OpeningHours[];
    nbChargingPoints: number;
  };
}

export interface PrivateStationProperties extends Omit<PublicStationProperties, 'properties'> {
  properties: {
    maxPower: number;
    price: number;
    isGreenEnergy: boolean;
    plugTypes: number[];
    hours: OpeningHours[];
  };
}

export interface MessageInput {
  receiverId: string;
  createdAt: string;
  body: string;
}

export interface GetStationFromParams {
  minPrice: number;
  maxPrice: number;
  plugTypes?: number[];
  range?: number;
  type?: number;
  userLat: number;
  userLong: number;
}

export interface StationRatingInput {
  stationId: string;
  userId: string;
  rate: number;
  creationDate: string;
  comment?: string;
}

export type UserRatingInput = Omit<StationRatingInput, 'stationId'>;
