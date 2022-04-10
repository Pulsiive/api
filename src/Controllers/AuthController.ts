import express from 'express';

class AuthController {
    static async register(req: express.Request, res: express.Response) {
        try {
            return res.json({
                accessToken: ''
            });
        } catch (e: any) {}
    }
}

export default AuthController;
