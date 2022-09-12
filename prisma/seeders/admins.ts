import prisma from '../../prisma/client';
import bcrypt from "bcryptjs";

(async () => {
    await prisma.admin.create({
        data: {
            email: 'test@mail.com',
            password: await bcrypt.hash('password', 10)
        },
    });

    console.log('Seeding admins done');
})();

