import EmailVerificationService from '../EmailVerificationService';
import prisma from '../../../../prisma/client';
import { user } from '../__mocks__/EmailVerificationMocks';
import AuthService from "../../Auth/AuthService";

beforeAll(async () => {
  await AuthService.register(user);
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: user.email
    }
  });
  await prisma.$disconnect();
});

describe('EmailVerificationService', () => {
  test('should request email verification', async () => {
    const res = await EmailVerificationService.request(user.email);
    expect(res).toBe(true);
  });

  test('should throw because invalid token', async () => {
    await expect(EmailVerificationService.verify(user.email, 'bad_token')).rejects.toThrow('Error: Invalid or expired token');
  });
});
