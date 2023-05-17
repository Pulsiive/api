import express from 'express';
import multer from 'multer';
import os from 'os';

import AuthController from '../Controllers/AuthController';
import UserController from '../Controllers/UserController';
import StationController from '../Controllers/StationController';
import PrivateStationController from '../Controllers/PrivateStationController';
import { AuthMiddleware } from '../Middlewares/AuthMiddleware';
import EmailVerificationController from '../Controllers/EmailVerificationController';
import SlotController from '../Controllers/SlotController';
import ReservationController from '../Controllers/ReservationController';
import PhoneNumberVerificationController from '../Controllers/PhoneNumberVerificationController';
import { AuthAndGuestMiddleware } from '../Middlewares/AuthAndGuestMiddleware';
import OAuthController from '../Controllers/OAuthController';
import PaymentController from "../Controllers/PaymentController";

const router = express.Router();
const upload = multer({ dest: os.tmpdir(), limits: { fieldSize: 25 * 1024 * 1024 } });

router.get('/api/v1/status', (req, res) => {
  res.status(200).json({ message: 'Service is up and running' });
});

router.post('/api/v1/auth/register', AuthController.register);
router.post('/api/v1/auth/login', AuthController.login);

router.post('/api/v1/payment', AuthMiddleware, PaymentController.store);
router.post('/api/v1/payment/balance', AuthMiddleware, PaymentController.storeFromBalance);
router.post('/api/v1/payment/top-up-balance', AuthMiddleware, PaymentController.topUpBalance);
router.post('/api/v1/payment-request', AuthMiddleware, PaymentController.createPaymentIntent);
router.get('/api/v1/payments', AuthMiddleware, PaymentController.index);

router.post('/api/v1/oauth/google/register', OAuthController.register);
router.post('/api/v1/oauth/google/login', OAuthController.login);

router.post('/api/v1/auth/resetPassword/:token', AuthController.resetPassword);
router.post('/api/v1/auth/requestPasswordReset', AuthController.reqPasswordReset);

router.post('/api/v1/phone-number/request', PhoneNumberVerificationController.request);
router.post('/api/v1/phone-number/verify', PhoneNumberVerificationController.verify);

router.get('/api/v1/users/find', AuthMiddleware, UserController.findUsers);
router.get('/api/v1/profile', AuthMiddleware, UserController.index);
router.patch('/api/v1/profile', AuthMiddleware, UserController.update);

router.get('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.getVehicle);
router.get('/api/v1/profile/vehicle', AuthMiddleware, UserController.getVehicles);
router.post('/api/v1/profile/vehicle', AuthMiddleware, UserController.createVehicle);
router.put('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.updateVehicle);
router.delete('/api/v1/profile/vehicle/:id', AuthMiddleware, UserController.deleteVehicle);

router.get('/api/v1/profile/station/:id', StationController.getFromId);
router.get('/api/v1/profile/stations', AuthMiddleware, PrivateStationController.getAll);
router.post('/api/v1/profile/station', AuthMiddleware, PrivateStationController.create);
router.put('/api/v1/profile/station/:id', AuthMiddleware, PrivateStationController.update);
router.delete('/api/v1/profile/station/:id', AuthMiddleware, PrivateStationController.delete);

router.get('/api/v1/stations/private/user/:id', PrivateStationController.getAllFromUser);
router.post('/api/v1/stations', AuthMiddleware, StationController.getFromParams);
router.get('/api/v1/stations/all', StationController.getAll);

router.post('/api/v1/emailVerification', EmailVerificationController.request);
router.post('/api/v1/requestEmailVerification/:token', EmailVerificationController.verify);

router.get('/api/v1/profile/message/:id', AuthMiddleware, UserController.getMessage);
router.get('/api/v1/profile/messages', AuthMiddleware, UserController.getMessages);
router.get(
  '/api/v1/profile/messages/last-by-user',
  AuthMiddleware,
  UserController.getLastMessageFromUsers
);
router.delete('/api/v1/profile/message/:id', AuthMiddleware, UserController.deleteMessage);
router.post('/api/v1/profile/message', AuthMiddleware, UserController.createMessage);

router.post('/api/v1/profile/contact/:id', AuthMiddleware, UserController.createContact);
router.delete('/api/v1/profile/contact/:id', AuthMiddleware, UserController.removeContact);
router.get('/api/v1/profile/contacts', AuthMiddleware, UserController.getContacts);

router.post('/api/v1/station/rate', AuthMiddleware, StationController.rate);
router.post('/api/v1/station/rate/like/:id', AuthMiddleware, StationController.likeComment);
router.post('/api/v1/station/rate/dislike/:id', AuthMiddleware, StationController.dislikeComment);

router.post('/api/v1/user/rate', AuthMiddleware, UserController.rate);
router.get('/api/v1/user/:id/rate', AuthMiddleware, UserController.getRatings);

router.post('/api/v1/slot', AuthMiddleware, SlotController.create);
router.patch('/api/v1/slot/:id', AuthMiddleware, SlotController.update);
router.get('/api/v1/slot', AuthAndGuestMiddleware, SlotController.index);
router.get('/api/v1/slot/:id', AuthMiddleware, SlotController.show);
router.delete('/api/v1/slot/:id', AuthMiddleware, SlotController.delete);

router.post('/api/v1/reservation/:slotId', AuthMiddleware, ReservationController.create);
router.get('/api/v1/reservation', AuthMiddleware, ReservationController.index);
router.get('/api/v1/reservation/:slotId', AuthMiddleware, ReservationController.show);
router.delete('/api/v1/reservation/:slotId', AuthMiddleware, ReservationController.delete);

router.post(
  '/api/v1/picture',
  upload.array('file', 3),
  AuthMiddleware,
  StationController.attachPicturesToRating
);

export = router;
