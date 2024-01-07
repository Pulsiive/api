import admin from 'firebase-admin';
import prisma from '../../../prisma/client';
import { ApiError } from '../../Errors/ApiError';

admin.initializeApp({
  credential: {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  } as any
});

class NotificationService {
  static async sendNotification(
    userId: string,
    notificationData: { title: string; body?: string },
    data?: { [key: string]: string }
  ) {
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
        ...notificationData
        // imageUrl: 'https://ucarecdn.com/46b04164-ec37-4ef3-a46e-0acfbef28f68/'
      },
      data,
      token: userObject.fcmToken
    };
    return await admin.messaging().send(message);
  }
}

export default NotificationService;
