import express from 'express';
import { errorWrapper } from '../Utils/errorWrapper';
import PromoCodeService from '../Services/PromoCodeService';


class CodePromoController {
  static async create(req: express.Request, res: express.Response) {
    try {
      await PromoCodeService.createPromoCodes();

      return res.json({
        success: true
      });
    } catch (e) {
      return errorWrapper(e, res);
    }
  }

  static async getCodePromos(req: express.Request, res: express.Response) {
    try {
      const codePromos = await PromoCodeService.index();
      console.log("voici les codes promos ------------------->   \n");
      console.log(codePromos);

      return res.json(codePromos);
    } catch (e) {
        return errorWrapper(e, res);
    }
  }
  

}

export default CodePromoController;
