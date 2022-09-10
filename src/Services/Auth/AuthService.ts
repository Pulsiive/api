import prisma from '../../../prisma/client';
import bcrypt from 'bcryptjs';
import JWTService from '../JWTService';
import { ApiError } from '../../Errors/ApiError';
import crypto from 'crypto';
import MailService from '../MailService';
import moment from 'moment';
import Site from '../Site';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(`${process.env.GOOGLE_CLIENT_ID}`);

class AuthService {
  static loginURL = `${process.env.CLIENT_URL}/login`;

  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
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
          dateOfBirth: data.dateOfBirth
        }
      });
    } catch (e) {
      console.log(e);
      throw new ApiError('Error: User registration failed', 422);
    }

    return await JWTService.signWrapper(user);
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });
    if (!user) throw new ApiError('Error: User not registered', 404);

    const isValid = await bcrypt.compare(data.password, user.password);
    if (isValid) return await JWTService.signWrapper(user);
    throw new ApiError('Error: Email address or password invalid', 401);
  }

  static async googleLogin(tokenId: any) {
    const response = await client.verifyIdToken({idToken: tokenId, audience: `${process.env.GOOGLE_CLIENT_ID}`});
    const email = response.getPayload()?.email ?? '';
    const firstName = response.getPayload()?.name ?? '';
    const lastName = response.getPayload()?.family_name ?? '';

    let user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                firstName: firstName, 
                lastName: lastName,
                email: email,
                password: `${email}${process.env.ACCESS_TOKEN_SECRET}`,
                dateOfBirth: new Date(),
            },
        });
    }

    return {...user, accessToken: await JWTService.signWrapper(user)}
}

  static async checkUserExist(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ApiError('Error: User not found', 404);
  }

  static async checkEmail(email: string, userId: string) {
    const user = await prisma.user.findFirst({ where: { email: email } });

    return !user || user.id === userId;
  }

  static async checkPassword(password: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return user && (await bcrypt.compare(password, user.password));
  }

  static async reqPasswordReset(email: string) {
    const resetToken = crypto.randomBytes(64).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ApiError('Error: User not found', 404);

    const passwordReset = await prisma.passwordReset.findUnique({ where: { email } });
    if (passwordReset) await prisma.passwordReset.delete({ where: { email } });

    await prisma.passwordReset.create({ data: { token: hash, email } });
    const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await MailService.send(
      Site.resetPasswordEmail,
      email,
      'Password Reset Request',
      { name: user.firstName, email, link },
      '../Resources/Mails/forgotPassword.handlebars'
    );

    return true;
  }

  static async resetPassword(email: string, token: string, password: string) {
    const passwordReset = await prisma.passwordReset.findUnique({ where: { email } });

    if (!passwordReset) throw new ApiError('Error: Invalid or expired token', 422);
    const now = moment();
    const expiresAt = moment(passwordReset.createdAt).add(1, 'hour');

    if (now.isAfter(expiresAt)) {
      await prisma.passwordReset.delete({ where: { id: passwordReset.id } });
      throw new ApiError('Error: Invalid or expired token', 422);
    }
    const isValid = await bcrypt.compare(token, passwordReset.token);
    if (!isValid) throw new ApiError('Error: Invalid or expired token', 422);
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hash
      }
    });

    const user: any = await prisma.user.findUnique({ where: { email } });
    await MailService.send(
      Site.resetPasswordEmail,
      email,
      'Password Reset Successfully',
      { name: user.name, loginURL: AuthService.loginURL, email },
      '../Resources/Mails/resetPasswordConfirmation.handlebars'
    );

    await prisma.passwordReset.delete({ where: { email } });

    return true;
  }
}

export default AuthService;
function now(): any {
  throw new Error('Function not implemented.');
}

