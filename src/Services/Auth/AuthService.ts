import prisma from '../../../prisma/client';
import bcrypt from 'bcryptjs';
import JWTService from '../JWTService';
import { ApiError } from '../../Errors/ApiError';

class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    timeZone: string;
  }) {
    let user = await prisma.user.findFirst({
      where: { email: data.email }
    });

    if (user) throw new ApiError('Error: User already exist', 409);

    const hash = await bcrypt.hash(data.password, 10);

    try {
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: hash,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          timeZone: data.timeZone
        }
      });
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: User registration failed', 422);
    }

    return await JWTService.signWrapper(user);
  }

  static async checkUserExist(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ApiError('Error: User not found', 404);
  }
}

export default AuthService;
