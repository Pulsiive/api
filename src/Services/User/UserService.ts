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
import { PlugType, Vehicle, Message, Rating } from '@prisma/client';
import bcrypt from 'bcryptjs';
import MailService from '../MailService';
import Site from '../Site';
import UploadCareService from '../UploadCareService';

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
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        isNotificationOn: true,
        isAlertOn: true,
        email: true
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.new_password && { password: await bcrypt.hash(data.new_password, 10) }),
        ...(data.isNotificationOn !== undefined && { isNotificationOn: data.isNotificationOn }),
        ...(data.isAlertOn !== undefined && { isAlertOn: data.isAlertOn })
      },
      select: { email: true, firstName: true, lastName: true }
    });

    if (user?.isNotificationOn) {
    }

    if (user?.isAlertOn) {
      if (data.email) {
        await MailService.send(
          Site.doNotReplyEmail,
          data.email,
          'Email Updated Successfully',
          { email: user.email },
          '../Resources/Mails/emailUpdatedConfirmation.handlebars'
        );
      }

      if (data.new_password) {
        await MailService.send(
          Site.doNotReplyEmail,
          user.email,
          'Password Updated Successfully',
          { email: user.email },
          '../Resources/Mails/passwordUpdatedConfirmation.handlebars'
        );
      }
    }

    return true;
  }

  static async updateProfilePicture(userId: string, picture: { path: string; filename: string }) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        profilePictureId: true
      }
    });
    if (!user) {
      throw new ApiError('Error: Invalid user ID', 400);
    }
    if (user.profilePictureId !== process.env.DEFAULT_PROFILE_PICTURE_ID) {
      await UploadCareService.deleteFileFromId(user?.profilePictureId);
    }
    const upload = await UploadCareService.uploadFile(picture.filename, picture.path);
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        profilePictureId: upload.file
      }
    });
    return upload;
  }

  static async getUserFromId(userId: string) {
    let user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        profilePictureId: true,
        privateStations: {
          include: {
            properties: true,
            coordinates: true
          }
        },
        wroteRatings: {
          include: {
            author: true
          }
        },
        receivedRatings: {
          include: {
            author: true
          }
        }
      }
    });
    return user;
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        isNotificationOn: true,
        isAlertOn: true,
        email: true
      }
    });

    return user;
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
        id: true,
        profilePictureId: true
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
          lastName: true,
          profilePictureId: true
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

  static async getUserStationsComments(userId: string): Promise<Rating[]> {
    const comments = await prisma.rating.findMany({
      where: {
        authorId: userId
      },
      include: {
        station: {
          include: {
            properties: true,
            coordinates: true
          }
        }
      }
    });
    return comments.filter((comment) => (comment.stationId ? true : false));
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
      },
      select: {
        customName: true,
        description: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureId: true
          }
        }
      }
    });
    return newContact;
  }

  static async updateContact(
    userId: string,
    update: { contactId: string; customName: string | undefined; description: string | undefined }
  ) {
    if (!update.customName && !update.description) {
      throw new ApiError('Error: Please provide a customName or description', 400);
    }
    const contactExists = await prisma.contact.findFirst({
      where: {
        authorId: userId,
        userId: update.contactId
      }
    });
    if (!contactExists) {
      throw new ApiError('Error: this user is not in your contact list', 500);
    }
    const query = {
      where: {
        id: contactExists.id
      },
      data: {},
      select: {
        customName: true,
        description: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureId: true
          }
        }
      }
    };
    if (update.customName) {
      query.data = {
        customName: update.customName
      };
    }
    if (update.description) {
      query.data = { ...query.data, description: update.description };
    }

    const updatedContact = await prisma.contact.update(query);
    return updatedContact;
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
            id: true,
            profilePictureId: true
          }
        },
        customName: true,
        description: true
      }
    });
    return contacts;
  }

  static async addFavoriteStation(userId: string, stationId: string) {
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    if (!station) {
      throw new ApiError('Error: Invalid station ID', 500);
    }
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        favoriteStations: {
          connect: {
            id: stationId
          }
        }
      }
    });
    return { message: 'success' };
  }

  static async removeFavoriteStation(userId: string, stationId: string) {
    const station = await prisma.station.findUnique({
      where: {
        id: stationId
      }
    });
    if (!station) {
      throw new ApiError('Error: Invalid station ID', 500);
    }
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        favoriteStations: {
          disconnect: {
            id: stationId
          }
        }
      }
    });
    return { message: 'success' };
  }

  static async getFavoriteStations(userId: string) {
    const userObject = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        favoriteStations: {
          include: {
            coordinates: true,
            properties: true,
            rates: {
              include: {
                author: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePictureId: true
                  }
                },
                likedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePictureId: true
                  }
                },
                dislikedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePictureId: true
                  }
                }
              }
            },
            owner: {
              select: {
                id: true,
                lastName: true,
                firstName: true,
                receivedRatings: true,
                emailVerifiedAt: true,
                profilePictureId: true
              }
            }
          }
        }
      }
    });

    return userObject?.favoriteStations;
  }
}

export default UserService;
