import prisma from '../../prisma/client';
import bcrypt from 'bcryptjs'
import JWTService from './JWTService';
import {ApiError} from "../Errors/ApiError";
import crypto from "crypto";
import MailService from "./MailService";
import Site from "./Site";

class AuthService {
    static async register(
        data: {
            email: string,
            password: string,
            firstName: string,
            lastName: string,
            dateOfBirth: string,
            timeZone: string
        }
    ) {
        let user = await prisma.user.findFirst({
            where: { email: data.email },
        });

        if (user)
            throw new ApiError('Error: User already exist', 409);

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
                },
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
                email: data.email,
            }
        });
        if (!user)
            throw new ApiError('Error: User not registered', 404);

        const isValid = await bcrypt.compare(data.password, user.password);
        if (isValid)
            return await JWTService.signWrapper(user);
        throw new ApiError('Error: Email address or password invalid', 401);
    }

    static async checkUserExist(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user)
            throw new ApiError('Error: User not found', 404);
    }

    static async reqPasswordReset(email: string) {
        const resetToken = crypto.randomBytes(64).toString('hex');
        const hash = await bcrypt.hash(resetToken, 10);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user)
            throw new ApiError('Error: User not found', 404);

        const passwordReset = await prisma.passwordReset.findUnique({ where: { email } });
        if (passwordReset)
            await prisma.passwordReset.delete({ where: { email } });

        await prisma.passwordReset.create({ data: { token: hash, email } });
        const link = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await MailService.send(
            Site.resetPasswordEmail,
            email,
            'Password Reset Request',
            {name: user.firstName, email, link},
            '../Resources/Mails/forgotPassword.handlebars'
        );

        return true;
    }
}

export default AuthService;
