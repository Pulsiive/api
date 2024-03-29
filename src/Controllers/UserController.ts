import express from 'express';
import UserService from '../Services/User/UserService';
import { VehicleInput } from '../Utils/types';
import { errorWrapper } from '../Utils/errorWrapper';
import prisma from '../../prisma/client';
import Validator from 'validatorjs';
import AuthService from '../Services/Auth/AuthService';
import updateProfileRules from '../Rules/updateProfileRules';
import { ApiError } from '../Errors/ApiError';
import MailService from '../Services/MailService';
import Site from '../Services/Site';

class UserController {
  static async getUserFromId(req: express.Request, res: express.Response) {
    try {
      const user = await UserService.getUserFromId(req.params.id);
      return res.json(user);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async updateProfilePicture(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const picture = req.file;

      if (!picture) {
        throw new ApiError('Error: Please provide a picture', 400);
      }
      const uploadResponse = await UserService.updateProfilePicture(userId, picture);
      return res.json(uploadResponse);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async findUsers(req: express.Request, res: express.Response) {
    try {
      const searchBy = req.query.searchBy;
      if (
        !searchBy ||
        (searchBy !== 'first_name' && searchBy !== 'last_name' && searchBy !== 'email')
      ) {
        throw new ApiError(
          "Query parameter 'searchBy' is expected. Value must be set to 'first_name', 'last_name', or 'email "
        );
      }
      const key = req.query.key as string;
      if (!key) {
        throw new ApiError("Expected 'key' query parameter");
      }
      const users = await UserService.findUsers(searchBy, key);
      return res.json({ users });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = req.body.user.payload.id;

      const vehicle = await UserService.getVehicle(vehicleId, userId);
      return res.json({ vehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getVehicles(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;

      const vehicle = await UserService.getVehicles(userId);
      return res.json({ vehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicle: VehicleInput = req.body.vehicle;
      const userId = req.body.user.payload.id;

      const createdVehicle = await UserService.createVehicle(vehicle, userId);
      return res.json({ createdVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const vehicleConfig = req.body.vehicle;
      const userId = req.body.user.payload.id;

      const createdVehicle = await UserService.updateVehicle(vehicleId, vehicleConfig, userId);
      return res.json({ createdVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteVehicle(req: express.Request, res: express.Response) {
    try {
      const vehicleId = req.params.id;
      const userId = req.body.user.payload.id;

      const deletedVehicle = await UserService.deleteVehicle(vehicleId, userId);
      return res.json({ deletedVehicle });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async index(req: express.Request, res: express.Response) {
    try {
      const id = req.body.user.payload.id;
      const user = await prisma.user.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerifiedAt: true,
          dateOfBirth: true,
          balance: true,
          isNotificationOn: true,
          isAlertOn: true,
          profilePictureId: true,
          favoriteStations: {
            include: {
              coordinates: true,
              properties: true,
              rates: {
                where: {
                  responseToRatingId: null
                },
                include: {
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profilePictureId: true
                    }
                  },
                  responses: {
                    include: {
                      author: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          profilePictureId: true
                        }
                      }
                    }
                  }
                }
              },
              owner: {
                include: {
                  receivedRatings: true
                }
              }
            }
          },
          contacts: {
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
          },
          likedRatings: true,
          dislikedRatings: true
        }
      });

      const userVehicles = await prisma.vehicle.findMany({
        where: {
          ownerId: id
        }
      });

      const userStations = await prisma.station.findMany({
        where: {
          ownerId: id
        },
        include: {
          coordinates: true,
          properties: {
            include: {
              slots: true
            }
          },
          rates: true
        }
      });

      return res.json({ ...user, vehicles: userVehicles, stations: userStations });
    } catch (e: any) {
      return res.status(422).json({
        message: 'Unprocessable entity'
      });
    }
  }

  static async update(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const {
        firstName,
        lastName,
        dateOfBirth,
        isNotificationOn,
        isAlertOn,
        email,
        password,
        new_password,
        new_password_confirmation
      } = req.body;
      const data = {
        firstName,
        lastName,
        dateOfBirth,
        isNotificationOn,
        isAlertOn,
        email,
        password,
        new_password,
        new_password_confirmation
      };
      const validator = new Validator(data, updateProfileRules);

      if (validator.fails()) return res.status(422).json({ error: 'unexpected-error' });
      if (data.email && !(await AuthService.checkEmail(data.email, userId)))
        return res.status(422).json({ error: 'email-already-taken' });
      if (data.password && !(await AuthService.checkPassword(data.password, userId)))
        return res.status(422).json({ error: 'bad-password' });

      const state = await UserService.update(userId, data);

      return res.json({
        success: state
      });
    } catch (e: any) {
      console.log(e);
      return res.status(422).json({
        error: 'unexpected-error'
      });
    }
  }

  static async getMessages(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messages = await UserService.getMessages(userId);
      return res.json(messages);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getMessage(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messageId = req.params.id;

      const message = await UserService.getMessage(messageId, userId);
      return res.json(message);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getLastMessageFromUsers(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;

      const messages = await UserService.getLastMessageFromUsers(userId);
      return res.json(messages);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteMessage(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const messageId = req.params.id;

      const deletedMessage = await UserService.deleteMessage(messageId, userId);
      return res.json(deletedMessage);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async createMessage(req: express.Request, res: express.Response) {
    try {
      const wss = req.app.get("wss")
      const message = req.body.message;
      const userId = req.body.user.payload.id;
      const validator = new Validator(message, {
        receiverId: 'required|string',
        body: 'required|string|min:1|max:300',
        createdAt: 'required|date'
      });
      if (validator.passes() && req.body.user.payload.id !== message.receiverId) {
        const newMessage = await UserService.createMessage(message, userId);
        const sender = await UserService.getProfile(userId);
        const receiver = await UserService.getProfile(message.receiverId);

        if (receiver?.isAlertOn) {
          await MailService.send(
            Site.doNotReplyEmail,
            receiver?.email,
            'Message received',
            { content: newMessage?.body, email: sender?.email },
            '../Resources/Mails/messageReceived.handlebars'
          );
        }

        wss.clients.forEach((client: any) => {
          if (client.id === message.receiverId) {
            client.send(JSON.stringify(newMessage));
          }
        });

        return res.json(newMessage);
      }
      throw new ApiError('Invalid input', 400);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async rate(req: express.Request, res: express.Response) {
    try {
      const input = req.body.input;
      const userId = req.body.user.payload.id;

      const validator = new Validator(input, {
        userId: 'required|string',
        rate: 'required|numeric|min:1|max:5',
        creationDate: 'required|date',
        comment: 'string|min:10|max:300'
      });

      if (validator.fails()) {
        throw new ApiError('Invalid input', 400);
      }
      const rate = await UserService.rate(input, userId);
      res.json({ rate });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getRatings(req: express.Request, res: express.Response) {
    try {
      const requestedUserId = req.params.id;

      const ratings = await UserService.getRatings(requestedUserId);
      res.json({ ratings });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async getUserStationsComments(req: express.Request, res: express.Response) {
    try {
      const userId = req.params.id ? req.params.id : req.body.user.payload.id;
      const comments = await UserService.getUserStationsComments(userId);

      res.json(comments);
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async createContact(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const contactId = req.params.id;

      const newContact = await UserService.createContact(userId, contactId);

      return res.json(newContact);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async removeContact(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const contactId = req.params.id;

      const contactDeleted = await UserService.deleteContactById(userId, contactId);
      return res.json(contactDeleted);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateContact(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const update = {
        contactId: req.body.contactId,
        customName: req.body.customName,
        description: req.body.description
      };
      if (!update.customName && !update.description) {
        throw new ApiError('Error: Please provide a customName or description', 400);
      }
      const updatedContact = await UserService.updateContact(userId, update);
      return res.json(updatedContact);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
  static async getContacts(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;

      const contacts = await UserService.getContacts(userId);
      return res.json(contacts);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async addFavoriteStation(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const stationId = req.params.id;
      const newFavoriteStation = await UserService.addFavoriteStation(userId, stationId);
      return res.json(newFavoriteStation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async removeFavoriteStation(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const stationId = req.params.id;
      const removedStation = await UserService.removeFavoriteStation(userId, stationId);
      return res.json(removedStation);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async getFavoriteStations(req: express.Request, res: express.Response) {
    try {
      const userId = req.body.user.payload.id;
      const favoriteStations = await UserService.getFavoriteStations(userId);

      return res.json(favoriteStations);
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default UserController;
