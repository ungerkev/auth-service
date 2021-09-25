import { Service } from 'typedi';
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { AuthService } from '../service/auth.service';
import { config } from 'dotenv';
import { UserService } from '../service/user.service';
import {IUser} from '../interfaces/IUser';
import {nodeEnv, oneYearInMs} from '../configs/app.conf';
import {IUserCookie} from '../interfaces/IUserCookie';
import {Session, SessionData} from 'express-session';
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
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const email: string = req.body.email || '';
        const password: string = req.body.password || '';
        const rememberMe: boolean = req.body.rememberMe || false;

        try {
            const user: IUser = await this.userService.doGetUserOfEmail(email);
            // TODO: check if refreshToken is required after implemented cookie login
            const token: { accessToken: string, refreshToken: string } = await this.authService.doLogin(email, password);

            req.session.accessToken = token.accessToken;
            req.session.firstName = user.firstName;
            req.session.uuid = user.uuid;

            if (rememberMe) {
                const cookieValue: IUserCookie = {
                    firstName: user.firstName,
                    uuid: user.uuid,
                    accessToken: token.accessToken,
                };

                res.cookie('user_cookie', JSON.stringify(cookieValue), {
                    expires: new Date(Date.now() + oneYearInMs),
                    httpOnly: true,
                    secure: (nodeEnv !== 'development'),
                });
            }

            // TODO: remove this response because of implementing httpOnly cookie authentication
            res.status(200).send({
                tokens: token,
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
     * Logout an user
     * @param req
     * email: string
     * @param res
     * @param next
     */
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = parseInt(req.params.userId, 10) || 0;
        try {
            await this.authService.doLogout(userId);
            res.clearCookie('user_session').status(200).send('Logged out successfully');
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }



    checkIsAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let isAuthenticated: boolean = false;
            const session:  Session & Partial<SessionData> = req.session;

            if (session.uuid && session.firstName && session.accessToken) {
                const user: IUser = await this.userService.doGetUserOfUuid(session.uuid);

                if (user.uuid === session.uuid && user.firstName === session.firstName && user.accessToken === session.accessToken) {
                    try {
                        this.authService.verifyAccessToken(user.accessToken);
                        isAuthenticated = true;
                    } catch (error: any) {
                        try {
                            // Handle refresh token
                            this.authService.verifyRefreshToken(user.refreshToken);
                            const newAccessToken = this.authService.generateAccessToken();
                            await this.userService.doSaveAccessToken(user.email, newAccessToken);
                            req.session.accessToken = newAccessToken;
                            isAuthenticated = true;
                        } catch (error: any) {
                            // Final error -> refresh token expired
                            isAuthenticated = false;
                            await this.authService.doLogout(user.id);
                            res.clearCookie('user_session');
                        }
                    }
                }
            }
            res.status(200).send(isAuthenticated);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
