import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import {
  VehicleInput,
  VehicleTypes,
  PlugTypes,
  VehicleElectricalTypes,
  MessageInput,
  UserRatingInput
} from '../../Utils/types';
import { PlugType, Vehicle, Message, Rating, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const getUserVehicle = async (userId: string, vehicleId: string): Promise<undefined | Vehicle> => {
  const userVehicles = await prisma.vehicle.findMany({
    where: {
      ownerId: userId
    }
  });
  return userVehicles.find((vehicle: Vehicle) => vehicle.id === vehicleId);
};

class UserService {
  static async update(userId: string, data: any) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.new_password && { password: await bcrypt.hash(data.new_password, 10) })
      },
      select: { email: true, firstName: true, lastName: true }
    });

    return true;
  }

  static async findUsers(searchBy: string, data: string) {
    let where;
    if (searchBy === 'first_name') {
      where = {
        firstName: {
          startsWith: data
        }
      };
    } else if (searchBy === 'last_name') {
      where = {
        lastName: {
          startsWith: data
        }
      };
    } else {
      where = {
        email: {
          startsWith: data
        }
      };
    }
    return await prisma.user.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        id: true
      }
    });
  }
  //TODO: remove useless try catch

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

  static async getVehicles(userId: string) {
    try {
      const userVehicles = await prisma.vehicle.findMany({
        where: {
          ownerId: userId
        }
      });

      return userVehicles;
    } catch (e) {
      throw new ApiError('Error: Get Vehicles failed');
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

  static async getMessage(messageId: string, userId: string): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      }
    });
    if (message?.authorId === userId || message?.receiverId === userId) {
      return message;
    }
    throw new ApiError('Error: Invalid message ID', 400);
  }

  static async getMessages(
    userId: string
  ): Promise<{ sentMessages: Message[]; receivedMessages: Message[] } | null> {
    return prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        sentMessages: true,
        receivedMessages: true
      }
    });
  }

  static async getLastMessageFromUsers(userId: string): Promise<any> {
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          {
            authorId: userId
          },
          {
            receiverId: userId
          }
        ]
      },
      distinct: ['receiverId', 'authorId'],
      orderBy: {
        createdAt: 'desc'
      }
    });

    let lastMessages: Message[] = [];
    // get most recent sent / received message by user and add user name + id
    allMessages.forEach((message) => {
      if (message.authorId === userId) {
        const messageIndex = lastMessages.map((message) => message.receiverId).indexOf(userId);
        if (messageIndex > -1) {
          if (lastMessages[messageIndex].createdAt < message.createdAt) {
            //replace current message if it more recent than the last received one
            lastMessages[messageIndex] = message;
          }
        } else {
          lastMessages.push(message);
        }
      } else {
        const messageIndex = lastMessages.map((message) => message.authorId).indexOf(userId);
        if (messageIndex > -1) {
          if (lastMessages[messageIndex].createdAt < message.createdAt) {
            //replace current message if it more recent than the last sent one
            lastMessages[messageIndex] = message;
          }
        } else {
          lastMessages.push(message);
        }
      }
    });

    const messagesAndUser = [];
    for (let i = 0; i < lastMessages.length; i++) {
      const userToFetchId =
        lastMessages[i].authorId === userId ? lastMessages[i].receiverId : lastMessages[i].authorId;
      const user = await prisma.user.findUnique({
        where: {
          id: userToFetchId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      });
      messagesAndUser.push({ message: lastMessages[i], user });
    }
    return messagesAndUser;
  }

  static async deleteMessage(messageId: string, userId: string): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId
      }
    });
    if (message?.authorId !== userId) {
      throw new ApiError('Error: Invalid message ID', 400);
    }
    await prisma.message.delete({
      where: {
        id: messageId
      }
    });
    return message;
  }

  static async createMessage(messageObject: MessageInput, userId: string): Promise<Message> {
    const { receiverId, body, createdAt } = messageObject;
    return await prisma.message.create({
      data: {
        author: {
          connect: {
            id: userId
          }
        },
        receiver: {
          connect: {
            id: receiverId
          }
        },
        body,
        createdAt
      }
    });
  }

  static async rate(input: UserRatingInput, userId: string): Promise<Rating> {
    if (input.userId === userId) {
      throw new ApiError('Error: Invalid user ID', 400);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: input.userId
      }
    });
    if (!user) {
      throw new ApiError('Error: Invalid user ID', 400);
    }
    return await prisma.rating.create({
      data: {
        recipient: {
          connect: {
            id: input.userId
          }
        },
        author: {
          connect: {
            id: userId
          }
        },
        rate: input.rate,
        comment: input.comment,
        date: input.creationDate
      }
    });
  }

  static async getRatings(userId: string): Promise<Rating[]> {
    const ratings = await prisma.rating.findMany({
      where: {
        recipientId: userId
      },
      include: {
        author: true
      }
    });
    return ratings;
  }

  static async createContact(userId: string, contactId: string) {
    const contactExists = await prisma.contact.findFirst({
      where: {
        authorId: userId,
        userId: contactId
      }
    });
    if (contactExists) {
      throw new ApiError('Error: this user is already in your contact list', 500);
    }
    const newContact = await prisma.contact.create({
      data: {
        author: {
          connect: {
            id: userId
          }
        },
        user: {
          connect: {
            id: contactId
          }
        }
      }
    });
    return newContact;
  }

  static async deleteContactById(userId: string, contactId: string) {
    const contact = await prisma.contact.deleteMany({
      where: {
        authorId: userId,
        userId: contactId
      }
    });
    if (contact.count > 0) {
      return { message: 'success' };
    } else {
      throw new ApiError('Error: contact not found', 404);
    }
  }

  static async getContacts(userId: any) {
    const contacts = await prisma.contact.findMany({
      where: {
        authorId: userId
      },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            id: true
          }
        }
      }
    });
    return contacts;
  }
}

export default UserService;
