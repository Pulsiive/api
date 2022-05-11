import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { ApiError } from "../Errors/ApiError";

handlebars.registerHelper('formatChangeInfo', function(increase, changePercent, options) {
    return `$${increase.toFixed(2)} | ${changePercent.toFixed(2)}%`
});

class MailService {
    static async send(from: string, to: string, subject: string, payload: any, template: string) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT),
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                }
            });

            const source = fs.readFileSync(path.join(__dirname, template), "utf8");
            const compiledTemplate = handlebars.compile(source);

            await transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                html: compiledTemplate(payload)
            });
        } catch (e) {
            console.log(e);
            throw new ApiError('Error: Mail Service Unavailable', 503);
        }
    }
}

export default MailService;
