import prisma from '../../../../prisma/client';
import PhoneNumberVerificationService from "../PhoneNumberVerificationService";
import {ApiError} from "../../../Errors/ApiError";

afterAll(async () => {
  await prisma.$disconnect();
});

describe('PhoneNumberVerificationService', () => {
  test('should request phone number verification', async () => {
    const res = await PhoneNumberVerificationService.request('+821098316022');
    expect(res).toBe(true);
  });

  test('should throw because invalid OTP', async () => {
    await expect(PhoneNumberVerificationService.verify('+821098316022', '1234')).rejects.toThrow(new ApiError('Error: Invalid or expired OTP', 401));
  });
});