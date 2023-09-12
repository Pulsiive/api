// @ts-ignore
require('dotenv').config();
// @ts-ignore
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_SECURITY_API_KEY;

const client = require('twilio')(accountSid, authToken);

export default class SMSService {
    static async send(body: string, to: string, from: string) {
        const message = await client.messages
        .create({
            body,
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
        });
    }
}

