import UserService from '../UserService';
import AuthService from '../../Auth/AuthService';
import prisma from '../../../../prisma/client';
import {
  user,
  secondUser,
  vehicle,
  vehicleNumeroDos,
  vehicleDBFormat,
  vehicleNumeroDosDBFormat
} from '../__mocks__/UserServiceMocks';

let userId: string;
let secondUserId: string;
let vehicleId: string;

beforeAll(async () => {
  await AuthService.register(user);
  await AuthService.register(secondUser);
  const userObject = await prisma.user.findUnique({
    where: {
      email: user.email
    }
  });
  if (userObject) {
    userId = userObject.id;
  }
  const secondUserObject = await prisma.user.findUnique({
    where: {
      email: secondUser.email
    }
  });
  if (secondUserObject) {
    secondUserId = secondUserObject.id;
  }
});

afterAll(async () => {
  await prisma.message.deleteMany();
  await prisma.user.delete({
    where: {
      email: user.email
    }
  });
  await prisma.user.delete({
    where: {
      email: secondUser.email
    }
  });
  await prisma.$disconnect();
});

describe('UserService - Vehicle', () => {
  test('should create vehicle', async () => {
    const createdVehicle = await UserService.createVehicle(vehicle, userId);
    vehicleId = createdVehicle.id;
    expect(createdVehicle).toEqual({
      ...vehicleDBFormat,
      id: expect.any(String),
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should return vehicle', async () => {
    const vehicle = await UserService.getVehicle(vehicleId, userId);
    expect(vehicle).toEqual({
      ...vehicleDBFormat,
      id: vehicleId,
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.getVehicle('666', userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });

  test('should update vehicle', async () => {
    const update = await UserService.updateVehicle(vehicleId, vehicleNumeroDos, userId);
    expect(update).toEqual({
      ...vehicleNumeroDosDBFormat,
      id: vehicleId,
      ownerId: expect.any(String),
      maxPower: expect.any(Object)
    });
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.updateVehicle('666', vehicleNumeroDos, userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });

  test('should delete vehicle', async () => {
    await UserService.deleteVehicle(vehicleId, userId);
    const nissanR34 = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId
      }
    });
    expect(nissanR34).toBeNull();
  });

  test('should throw because vehicle does not exists', async () => {
    await expect(UserService.deleteVehicle('666', userId)).rejects.toThrow(
      'Error: Invalid vehicle ID'
    );
  });
});

//    -           __
// --           ~( @\   \
//---   _________]_[__/__>_______
//     / _____ \ <>    | _____  \
//   =\_/ __ \_\______|_/ __ \__D
// ______(__)_____________(__)____
//           vroum vroum

const createMessage = (receiverId: string, body = 'hello world') => {
  return UserService.createMessage(
    {
      receiverId,
      createdAt: '2022-06-25T14:32:37.664Z',
      body
    },
    userId
  );
};

describe('UserService - Messages', () => {
  test('should create message', async () => {
    const newMessage = await createMessage(secondUserId);
    expect(newMessage).not.toBeNull();
  });

  test('should return message as author', async () => {
    const newMessage = await createMessage(secondUserId);
    const message = await UserService.getMessage(newMessage.id, userId);
    expect(message.body).toEqual('hello world');
  });

  test('should return message as receiver', async () => {
    const newMessage = await createMessage(secondUserId);
    const message = await UserService.getMessage(newMessage.id, secondUserId);
    expect(message.body).toEqual('hello world');
  });

  test('should return all messages', async () => {
    const sentMessage = await createMessage(secondUserId);
    const receivedMessage = await createMessage(userId, 'received message');
    const allMessages = await UserService.getMessages(userId);
    expect(
      allMessages?.receivedMessages.find((message) => message.id === receivedMessage.id)
    ).toBeDefined();
    expect(
      allMessages?.sentMessages.find((message) => message.id === sentMessage.id)
    ).toBeDefined();
  });

  test('should throw because message does not exists', async () => {
    await expect(UserService.getMessage('666', userId)).rejects.toThrow(
      'Error: Invalid message ID'
    );
  });

  test('should delete message', async () => {
    const newMessage = await createMessage(secondUserId);
    await UserService.deleteMessage(newMessage.id, userId);
    const oldMessage = await prisma.message.findUnique({
      where: {
        id: newMessage.id
      }
    });
    expect(oldMessage).toBeNull();
  });

  test('should throw because user is not author if message', async () => {
    const newMessage = await createMessage(secondUserId);
    await expect(UserService.deleteMessage(newMessage.id, secondUserId)).rejects.toThrow(
      'Error: Invalid message ID'
    );
  });

  test('should throw because message does not exists', async () => {
    await expect(UserService.deleteMessage('666', userId)).rejects.toThrow(
      'Error: Invalid message ID'
    );
  });
});
