import { Service } from 'typedi';
import {
    NextFunction,
    Request,
    Response,
} from 'express';

/**
 * Auth Middleware
 */
@Service()
export class AllowedHeadersMiddleware {
    constructor() {}

    checkHeaders = (req: Request, res: Response, next: NextFunction): void => {
        // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
        const allowedMethods: string[] = [
            'OPTIONS',
            'HEAD',
            'CONNECT',
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
        ];

        if (!allowedMethods.includes(req.method)) {
            res.status(405).send(`${req.method} not allowed.`);
        }

        next();
    }
}
