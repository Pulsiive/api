import prisma from '../../prisma/client';
import { ApiError } from '../Errors/ApiError';
import {
  VehicleInput,
  VehicleTypes,
  PlugTypes,
  VehicleElectricalTypes,
  PrivateStationProperties,
  StationAndPayload
} from '../Utils/types';
import { PlugType, Vehicle, Station } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime';
import { stat } from 'fs';

const getUserVehicle = async (userId: string, vehicleId: string): Promise<undefined | Vehicle> => {
  const userVehicles = await prisma.vehicle.findMany({
    where: {
      ownerId: userId
    }
  });
  return userVehicles.find((vehicle: Vehicle) => vehicle.id === vehicleId);
};

const getUserStation = async (
  userId: string,
  stationId: string
): Promise<undefined | StationAndPayload> => {
  const userStations = await prisma.station.findMany({
    where: {
      ownerId: userId
    },
    include: {
      properties: {
        include: {
          hours: true
        }
      },
      comments: true,
      coordinates: true
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
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              hours: true
            }
          },
          comments: true
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
          properties: {
            include: {
              hours: true
            }
          }
        }
      });
      return createdStation;
    } catch (e) {
      if (e instanceof PrismaClientValidationError) {
        throw new ApiError('Error: Invalid properties');
      }
      throw new ApiError('Error: Failed to create a private station');
    }
  }

  static async updateStation(
    props: PrivateStationProperties,
    userId: string,
    stationId: string
  ): Promise<Station> {
    try {
      //TODO: improve this - don't delete current hours

      const station = await getUserStation(userId, stationId);

      if (!station) throw new ApiError('Error: Invalid station ID');

      const stationsPropertiesWithoutHours = {
        ...props.properties,
        plugTypes: props.properties.plugTypes.map((plugId: number) => PlugTypes[plugId])
      };
      const stationHours = props.properties.hours.map(
        (hour: { day: number; openTime: number; closeTime: number }) => ({
          ...hour,
          openTime: new Date(hour.openTime),
          closeTime: new Date(hour.closeTime)
        })
      );
      if (station.properties) {
        await prisma.stationHours.deleteMany({
          where: {
            stationPropertiesId: station.properties.id
          }
        });
      }
      const updatedStation = await prisma.station.update({
        where: {
          id: stationId
        },
        data: {
          coordinates: {
            update: props.coordinates
          },
          properties: {
            update: {
              ...stationsPropertiesWithoutHours,
              hours: {
                create: stationHours
              }
            }
          }
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              hours: true
            }
          },
          comments: true
        }
      });
      return updatedStation;
    } catch (e) {
      if (e instanceof ApiError) {
        throw e;
      }
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
            properties: {
              include: {
                hours: true
              }
            },
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
