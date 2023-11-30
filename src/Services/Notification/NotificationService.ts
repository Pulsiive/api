import admin from 'firebase-admin';
import * as firebaseEnv from '../../../pulsive-85ebf-firebase-adminsdk-1xr4d-be899a8443.json';
import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';

admin.initializeApp({
  credential: admin.credential.cert(firebaseEnv)
});

class NotificationService {
  static async sendNotification(userId: string, data: { title: string; body?: string }) {
    const userObject = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        fcmToken: true
      }
    });
    if (!userObject) {
      throw new ApiError('Error: User not found', 404);
    }
    if (!userObject.fcmToken) {
      throw new ApiError('Error: Missing fcm token', 500);
    }
    const message = {
      notification: {
        ...data
        // imageUrl: 'https://ucarecdn.com/46b04164-ec37-4ef3-a46e-0acfbef28f68/'
      },
      token: userObject.fcmToken
    };
    return await admin.messaging().send(message);
  }
}

export default NotificationService;
