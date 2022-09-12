import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';
import moment from 'moment';
import otpGenerator from 'otp-generator';
import SMSService from "../SMSService";

export default class PhoneNumberVerificationService {

    static async request(phoneNumber: string) {
        const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        const phoneNumberVerification = await prisma.phoneNumberVerification.findUnique({ where: { phoneNumber } });
        if (phoneNumberVerification) await prisma.phoneNumberVerification.delete({ where: { phoneNumber } });

        await prisma.phoneNumberVerification.create({ data: { otp, phoneNumber } });
        // @ts-ignore
        await SMSService.send(`[Pulsive]: Your OTP is ${otp}`, phoneNumber, process.env.TWILIO_PHONE_NUMBER);

        return true;
    }

    static async verify(phoneNumber: string, otp: string) {
        const phoneNumberVerification = await prisma.phoneNumberVerification.findUnique({ where: { phoneNumber } });

        if (!phoneNumberVerification) throw new ApiError('Error: Invalid or expired OTP', 401);
        const now = moment();
        const expiresAt = moment(phoneNumberVerification.createdAt).add(15, 'minutes');

        if (now.isAfter(expiresAt)) {
            await prisma.phoneNumberVerification.delete({ where: { id: phoneNumberVerification.id } });
            throw new ApiError('Error: Invalid or expired OTP', 401);
        }
        const isValid = otp === phoneNumberVerification.otp;
        if (!isValid) throw new ApiError('Error: Invalid or expired OTP', 401);

        console.log(`OTP ${otp} has been successfully checked !`);

        await prisma.phoneNumberVerification.delete({ where: { phoneNumber } });

        return true;
    }
}

