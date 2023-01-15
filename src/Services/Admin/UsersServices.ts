import { ApiError } from "../../Errors/ApiError";
import prisma from "../../../prisma/client";
import bcrypt from "bcryptjs";

class UsersServices {
    static async getUsers(data: any) {
        const users = await prisma.user.findMany();
        if (!users) {
            throw new ApiError('Error: Users not found', 401);
        } else {
            return { users: users }
        }
    }
    static async addUser(firstName: string, lastName: string, email: string, password: string, dateOfBirth: Date) {
        const user = await prisma.user.create({
            data: {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: await bcrypt.hash(password, 10),
                dateOfBirth: new Date(dateOfBirth)
            },
        });
        if (!user) {
            throw new ApiError('Error: Users not created', 401);
        } else {
            return user
        }
    }

    static async updateUser(firstName: string, lastName: string, email: string, password: string, dateOfBirth: Date) {
        const user = await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: await bcrypt.hash(password, 10),
                dateOfBirth: new Date(dateOfBirth)
            },
        });
        if (!user) {
            throw new ApiError('Error: Users not created', 401);
        } else {
            return user
        }
    }

    static async deleteUser(email: string) {
        const user = await await prisma.user.delete({
            where: {
                email: email,
            },
        });
        if (!user) {
            throw new ApiError('Error: Users not found', 401);
        } else {
            return "User has been deleted"
        }
    }
}

export default UsersServices;
