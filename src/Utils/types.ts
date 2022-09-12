import { VehicleType, PlugType, VehicleElectricalType, Prisma } from '@prisma/client';

export type StationAndPayload = Prisma.StationGetPayload<{
  include: {
    properties: {
      include: {
        slots: true;
      };
    };
    comments: true;
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

export interface Slot {
  day: number;
  opensAt: string;
  closesAt: string;
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
    slots: Slot[];
    nbChargingPoints: number;
  };
}

export interface PrivateStationProperties extends Omit<PublicStationProperties, 'properties'> {
  properties: {
    maxPower: number;
    price: number;
    isGreenEnergy: boolean;
    plugTypes: number[];
    slots: Slot[];
  };
}

export interface MessageInput {
  receiverId: string;
  createdAt: string;
  body: string;
}
