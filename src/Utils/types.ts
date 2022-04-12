import { VehicleType, PlugType, VehicleElectricalType } from '@prisma/client';

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
