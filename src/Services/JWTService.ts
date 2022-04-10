import jwt from 'jsonwebtoken';
import { ApiError } from '../Errors/ApiError';

class JWTService {
    static signWrapper(payload: any) {
        return new Promise((resolve, reject) => {
            jwt.sign({ payload }, process.env.ACCESS_TOKEN_SECRET || '', {}, (err, token) => {
                if (err)
                    reject(new ApiError('Error: Invalid Token', 401));

                return resolve(token);
            });
        });
    }

    static verifyWrapper(token: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '', (err, payload) => {
                if (err)
                    reject(new ApiError('Error: Unauthorized', 401));

                return resolve(payload);
            });
        });
    }
}

export default JWTService;
