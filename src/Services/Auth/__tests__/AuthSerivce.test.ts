import AuthService from '../AuthService';
import prisma from '../../../../prisma/client';
import { user } from '../__mocks__/AuthServiceMocks';

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: 'fakeAccount@test.com'
    }
  });
  await prisma.$disconnect();
});

describe('AuthService', () => {
  test('should create user', async () => {
    const accessToken = await AuthService.register(user);
    expect(accessToken).toBeDefined();
  });

  test('should throw because user already exists', async () => {
    await expect(AuthService.register(user)).rejects.toThrow('Error: User already exist');
  });
});
