import express from 'express';
import UsersServices from '../../Services/Admin/UsersServices';


import { errorWrapper } from '../../Utils/errorWrapper';

class AdminController {
  static async getUsers(req: express.Request, res: express.Response) {
    try {
      const users = await UsersServices.getUsers(req.body);
      return res.json(users);
    } catch (e: any) {
      return errorWrapper(e, res)
    }
  }

  static async addUser(req: express.Request, res: express.Response) {
    try {
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const password = req.body.password;
      const dateOfBirth = req.body.dateOfBirth;

      const user = await UsersServices.addUser(firstName, lastName, email, password, dateOfBirth);
      return res.json({ user });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async updateUser(req: express.Request, res: express.Response) {
    try {
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const email = req.body.email;
      const password = req.body.password;
      const dateOfBirth = req.body.dateOfBirth;

      const user = await UsersServices.updateUser(firstName, lastName, email, password, dateOfBirth);
      return res.json({ user });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }

  static async deleteUser(req: express.Request, res: express.Response) {
    try {
      const email = req.body.email;
      const user = await UsersServices.deleteUser(email);
      return res.json({ user });
    } catch (e: any) {
      return errorWrapper(e, res);
    }
  }
}

export default AdminController;
