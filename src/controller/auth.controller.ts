import { Service } from 'typedi';
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { AuthService } from '../service/auth.service';
import { config } from 'dotenv';
import { UserService } from '../service/user.service';
import { IUser } from '../interfaces/IUser';
// import * as uuid from 'uuid';
config(); // load data from .env

/**
 * Auth Controller
 */
@Service()
export class AuthController {
    constructor(private authService: AuthService,
                private userService: UserService) {}

    /**
     * login a new user and sent access and refresh token to the client
     * @param req
     * email: string
     * password: string
     * @param res
     * @param next
     */
    loginController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const email: string = req.body.email || '';
        const password: string = req.body.password || '';
        // const rememberMe: boolean = req.body.rememberMe || false;

        try {
            const user: IUser = await this.userService.getUserOfEmail(email);
            const tokens: { accessToken: string, refreshToken: string } = await this.authService.login(email, password);

            req.session.accessToken = tokens.accessToken;
            req.session.firstName = user.firstName;
            req.session.uuid = user.uuid;

            /* if (rememberMe) {
                const cookieValue: IUserCookie = {
                    firstName: user.firstName,
                    uuid: user.uuid,
                    accessToken: tokens.accessToken,
                };

                res.cookie('user_cookie', JSON.stringify(cookieValue), {
                    expires: new Date(Date.now() + oneYearInMs),
                    httpOnly: true,
                    secure: (nodeEnv !== 'development'),
                });
            } */
            res.status(200).send({ success: true });
        } catch (e: any) {
            next(e);
        }
    }

    /**
     * Logout an user
     * @param req
     * email: string
     * @param res
     * @param next
     */
    logoutController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = parseInt(req.params.userId, 10) || 0;
        try {
            await this.authService.logout(userId);
            res.clearCookie('user_session').status(200).send('Logged out successfully');
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * Check if a user is authenticated
     * @param req
     * @param res
     * @param next
     */
    isAuthenticatedController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let isAuthenticated: boolean = false;

            // normal session login
            if (req.session.uuid && req.session.firstName && req.session.accessToken) {
                const user: IUser = await this.userService.getUserOfUuid(req.session.uuid);

                if (user && user.uuid === req.session.uuid && user.firstName === req.session.firstName && user.accessToken === req.session.accessToken) {
                    try {
                        this.authService.verifyAccessToken(user.accessToken);
                        isAuthenticated = true;
                    } catch (error: any) {
                        try {
                            // Handle refresh token
                            this.authService.verifyRefreshToken(user.refreshToken);
                            const newAccessToken = this.authService.generateAccessToken();
                            await this.userService.saveAccessToken(user.email, newAccessToken);
                            req.session.accessToken = newAccessToken;
                            isAuthenticated = true;
                        } catch (error: any) {
                            // Final error -> refresh token expired
                            isAuthenticated = false;
                            await this.authService.logout(user.id);
                        }
                    }
                } // TODO: else if (user && user.accessToken !== req.session.accessToken) {
                    // token theft!!!! alert user
                // }
            }

            if (!isAuthenticated) {
                res.clearCookie('user_session');
            }
            res.status(200).send(isAuthenticated);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
