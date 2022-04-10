import prisma from '../../prisma/client';
import bcrypt from 'bcryptjs'
import JWTService from './JWTService';
import {ApiError} from "../Errors/ApiError";

class AuthService {
    static async register(
        data: {
            email: string,
            password: string,
            fistName: string,
            lastName: string,
            dateOfBirth: Date,
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
                    firstName: data.fistName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    timeZone: data.timeZone
                },
            });
        } catch (e) {
            throw new ApiError('Error: User registration failed', 422);
        }

        return await JWTService.signWrapper(user);
    }
}

export default AuthService;
