import prisma from '../../../prisma/client';
import bcrypt from 'bcryptjs';
import JWTService from '../JWTService';
import { ApiError } from '../../Errors/ApiError';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class OAuthService {
  static async verifyGoogleToken(token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      return { payload: ticket.getPayload() };
    } catch (error) {
      throw new ApiError("Error: User not found", 422);
    }
  }

  static async register(token: string, data: {
    email: any;
    firstName: any;
    lastName: any;
  }) {
    let user = await prisma.user.findFirst({
      where: { email: data.email }
    });

    if (user) throw new ApiError('Error: User already exist', 409);

    const hash = await bcrypt.hash(token, 10);

    try {
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: hash,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(),
          isFromOAuth: true
        }
      });
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: User registration failed', 422);
    }

    return {user, accessToken: await JWTService.signWrapper(user)};
  }

  static async login(email: any) {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user) throw new ApiError('Error: User not registered', 404);
      return {user, accessToken: await JWTService.signWrapper(user)};
  }
}

export default OAuthService;
