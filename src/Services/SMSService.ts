import twilio from 'twilio';
// @ts-ignore
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_SECURITY_API_KEY);


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
