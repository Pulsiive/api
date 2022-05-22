import prisma from '../../prisma/client';
import { ApiError } from '../Errors/ApiError';
import {
  VehicleInput,
  VehicleTypes,
  PlugTypes,
  VehicleElectricalTypes,
  PrivateStationProperties
} from '../Utils/types';
import { PlugType, Vehicle, Station } from '@prisma/client';

const getUserVehicle = async (userId: string, vehicleId: string): Promise<undefined | Vehicle> => {
  const userVehicles = await prisma.vehicle.findMany({
    where: {
      ownerId: userId
    }
  });
  return userVehicles.find((vehicle: Vehicle) => vehicle.id === vehicleId);
};

const getUserStation = async (userId: string, stationId: string): Promise<undefined | Station> => {
  const userStations = await prisma.station.findMany({
    where: {
      ownerId: userId
    }
  });
  return userStations.find((station: Station) => station.id === stationId);
};

class UserService {
  static async getVehicle(vehicleId: string, userId: string): Promise<Vehicle> {
    try {
      const vehicle = await getUserVehicle(userId, vehicleId);
      if (vehicle) {
        return vehicle;
      }
      throw new ApiError('Error: Invalid vehicle ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Vehicle deletion failed');
    }
  }

  static async createVehicle(vehicle: VehicleInput, userId: string): Promise<Vehicle> {
    try {
      const plugTypes: Array<PlugType> = vehicle.plugTypes.map((plugId) => PlugTypes[plugId]);

      const createdVehicle = await prisma.vehicle.create({
        data: {
          owner: {
            connect: {
              id: userId
            }
          },
          type: VehicleTypes[vehicle.type],
          plugTypes,
          electricalType: VehicleElectricalTypes[vehicle.electricalType],
          maxPower: vehicle.maxPower
        }
      });
      return createdVehicle;
    } catch (e) {
      throw new ApiError('Error: Vehicle creation failed');
    }
  }

  static async updateVehicle(
    vehicleId: string,
    vehicle: VehicleInput,
    userId: string
  ): Promise<Vehicle> {
    try {
      const outdatedVehicle = await getUserVehicle(userId, vehicleId);
      if (outdatedVehicle) {
        const plugTypes: Array<PlugType> = vehicle.plugTypes.map((plugId) => PlugTypes[plugId]);

        const updatedVehicle = await prisma.vehicle.update({
          where: {
            id: vehicleId
          },
          data: {
            type: VehicleTypes[vehicle.type],
            plugTypes,
            electricalType: VehicleElectricalTypes[vehicle.electricalType],
            maxPower: vehicle.maxPower
          }
        });
        return updatedVehicle;
      }
      throw new ApiError('Error: Invalid vehicle ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Vehicle creation failed');
    }
  }

  static async deleteVehicle(vehicleId: string, userId: string): Promise<Vehicle> {
    try {
      const vehicle = await getUserVehicle(userId, vehicleId);
      if (vehicle) {
        const deletedVehicle = await prisma.vehicle.delete({
          where: {
            id: vehicleId
          }
        });
        return deletedVehicle;
      }
      throw new ApiError('Error: Invalid vehicle ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Vehicle deletion failed');
    }
  }

  static async getStation(stationId: string): Promise<Station> {
    try {
      const station = await prisma.station.findUnique({
        where: {
          id: stationId
        }
      });
      if (station) {
        return station;
      }
      throw new ApiError('Error: Invalid station ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Invalid station ID');
    }
  }

  static async createStation(props: PrivateStationProperties, userId: string): Promise<Station> {
    try {
      const stationsPropertiesWithoutHours = {
        ...props.properties,
        isPublic: false,
        nbChargingPoints: 1,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId])
      };
      const stationHours = props.properties.hours.map(
        (hour: { day: number; openTime: number; closeTime: number }) => ({
          ...hour,
          openTime: new Date(hour.openTime),
          closeTime: new Date(hour.closeTime)
        })
      );

      const createdStation = await prisma.station.create({
        data: {
          owner: {
            connect: {
              id: userId
            }
          },
          coordinates: {
            create: props.coordinates
          },
          properties: {
            create: {
              ...stationsPropertiesWithoutHours,
              hours: {
                create: stationHours
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: true
        }
      });
      return createdStation;
    } catch (e) {
      throw new ApiError('Error: Failed to create a private station');
    }
  }

  static async deleteStation(stationId: string, userId: string): Promise<Station> {
    try {
      const station = await getUserStation(userId, stationId);
      if (station) {
        const deletedStation = await prisma.station.delete({
          where: {
            id: stationId
          },
          include: {
            coordinates: true,
            properties: true,
            comments: true
          }
        });
        return deletedStation;
      }
      throw new ApiError('Error: Invalid station ID', 400);
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
      throw new ApiError('Error: Station deletion failed');
    }
  }
}

export default UserService;
