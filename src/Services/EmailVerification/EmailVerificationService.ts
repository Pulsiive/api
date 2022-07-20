import prisma from '../../../prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../Errors/ApiError';
import crypto from 'crypto';
import MailService from '../MailService';
import moment from 'moment';
import Site from '../Site';

class EmailVerificationService {
  static async request(email: string) {
    const token = crypto.randomBytes(64).toString('hex');
    const hash = await bcrypt.hash(token, 10);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ApiError('Error: User not found', 404);

    const emailVerification = await prisma.emailVerification.findUnique({ where: { email } });
    if (emailVerification) await prisma.emailVerification.delete({ where: { email } });

    await prisma.emailVerification.create({ data: { token: hash, email } });
    const link = `${process.env.CLIENT_URL}/email-verification/${token}?email=${email}`;
    await MailService.send(
      Site.doNotReplyEmail,
      email,
      'Email Verification',
      { name: user.firstName, email, link },
      '../Resources/Mails/emailVerification.handlebars'
    );

    return true;
  }

  static async verify(email: string, token: string) {
    const emailVerification = await prisma.emailVerification.findUnique({ where: { email } });

    if (!emailVerification) throw new ApiError('Error: Invalid or expired token', 422);
    const now = moment();
    const expiresAt = moment(emailVerification.createdAt).add(3, 'hour');

    if (now.isAfter(expiresAt)) {
      await prisma.emailVerification.delete({ where: { id: emailVerification.id } });
      throw new ApiError('Error: Invalid or expired token', 422);
    }
    const isValid = await bcrypt.compare(token, emailVerification.token);
    if (!isValid) throw new ApiError('Error: Invalid or expired token', 422);
    await prisma.user.update({
      where: { email },
      data: {
        emailVerifiedAt: now.toISOString()
      }
    });

    await prisma.emailVerification.delete({ where: { email } });

    return true;
  }
}

export default EmailVerificationService;
