import { Service } from 'typedi';
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { AuthService } from '../service/auth.service';
import { config } from 'dotenv';
import { UserService } from '../service/user.service';
config(); // load data from .env

/**
 * Auth Controller
 */
@Service()
export class AuthController {
    constructor(private authService: AuthService,
                private userService: UserService) {}

    /**
     * register a new user
     * @param req
     * email: string
     * password: string
     * @param res
     * @param next
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const email = req.body.email || '';
        const password = req.body.password || '';

        try {
            const newUser = await this.authService.doRegister(email, password);
            res.status(200).json({ newUser });
        } catch (e: any) {
            next(e);
        }
    }

    /**
     * login a new user and sent access and refresh token to the client
     * @param req
     * email: string
     * password: string
     * @param res
     * @param next
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const email = req.body.email || '';
        const password = req.body.password || '';

        try {
            const tokens = await this.authService.doLogin(email, password);
            const user = await this.userService.doGetUserOfEmail(email);
            /* res.cookie('tokens', tokens, {
                expires: new Date(Date.now() + oneYearInMs),
                secure: (nodeEnv === 'production') ? true : false,
                httpOnly: true,
              }); */
            res.status(200).json({
                tokens,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            });
        } catch (e: any) {
            next(e);
        }
    }

    /**
     * check if a token is valid
     * @param req
     * authorization: header
     * @param res
     * @param next
     */
    checkToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || '';

        try {
            await this.authService.doCheckToken(token);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * refresh an expired token
     * @param req
     * refreshToken: string
     * @param res
     * @param next
     */
    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const refreshToken = req.body.refreshToken;
        try {
            const accessToken = await this.authService.doRefreshToken(refreshToken);
            res.status(200).json({ accessToken });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * Logout an user
     * @param req
     * email: string
     * @param res
     * @param next
     */
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const email = req.body.email || '';
        try {
            const loggedOut = await this.authService.doLogout(email);
            res.status(200).json({ loggedOut });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    checkIsAdmin = async (req: Request, res: Response): Promise<void> => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || '';
        try {
            const isAdmin = await this.authService.doCheckIsAdmin(token);
            res.status(200).json(isAdmin);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
