import bcrypt from 'bcryptjs'
import JWTService from "../JWTService";
import { ApiError } from "../../Errors/ApiError";
import prisma from "../../../prisma/client";

class AuthService {
    static async login(data: any) {
        console.log(data);
        const admin = await prisma.admin.findUnique({
            where: {
                email: data.email,
            },
        });
        if (!admin) {
            throw new ApiError('Error: Admin not registered', 401);
        } else {
            const isValid = await bcrypt.compare(data.password, admin.password);
            if (isValid)
                return {accessToken: await JWTService.signWrapper(admin)}
            throw new ApiError('Error: Invalid Email address or password', 401);
        }
    }

    static async checkAdminExist(id: string) {
        const admin = await prisma.admin.findUnique({ where: { id } });

        if (!admin)
            throw new ApiError('Error: Admin not found', 404);
    }
}

export default AuthService;
