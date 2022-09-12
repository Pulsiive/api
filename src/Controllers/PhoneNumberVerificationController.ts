import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import Validator from 'validatorjs';
import { ApiError } from '../Errors/ApiError';
import PhoneNumberVerificationService from "../Services/PhoneNumberVerification/PhoneNumberVerificationService";

Validator.register('phone_number', function(value: any) {
    return value.match(/^[+]*[(]?\d{1,4}[)]?[-\s./\d]*$/);
}, '[Unprocessable entity] The :attribute phone number is not in the good format.');

class PhoneNumberVerificationController {
    static async request(req: express.Request, res: express.Response) {
        try {
            const { phoneNumber } = req.body;
            const data = { phoneNumber };

            const validator = new Validator(data, {
                phoneNumber: 'required|phone_number'
            });

            if (validator.fails()) {
                console.log(validator.errors);
                throw new ApiError('Error: Unprocessable entity', 422);
            }

            const state = await PhoneNumberVerificationService.request(phoneNumber);

            res.json({ success: state });
        } catch (e: any) {
            return errorWrapper(e, res);
        }
    }

    static async verify(req: express.Request, res: express.Response) {
        try {
            const otp = req.query.otp as any;
            const data = { phoneNumber: req.body.phoneNumber, otp };

            const validator = new Validator(data, {
                phoneNumber: 'required|phone_number',
                otp: 'required|numeric|size:4'
            });

            if (validator.fails()) {
                console.log(validator.errors);
                throw new ApiError('Error: Unprocessable entity', 422);
            }

            const state = await PhoneNumberVerificationService.verify(data.phoneNumber, data.otp);

            res.json({ success: state });
        } catch (e: any) {
            return errorWrapper(e, res);
        }
    }
}

export default PhoneNumberVerificationController;