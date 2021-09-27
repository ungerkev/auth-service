import { Service } from 'typedi';
import { Request, Response } from 'express';
import { UserService } from '../service/user.service';

/**
 * User Controller
 */
@Service()
export class UserController {
    constructor(private userService: UserService) {}

    /**
     * update user and save refresh token to the table
     * @param req
     * email: string
     * refreshToken: string
     * @param res
     */
    saveRefreshTokenController = async (req: Request, res: Response): Promise<void> => {
        const email: string = req.body.email || '';
        const refreshToken: string = req.body.refreshToken || '';

        try {
            await this.userService.saveRefreshToken(email, refreshToken);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * returns the refresh token from the user table from DB
     * @param req
     * email: string
     * @param res
     */
    getRefreshToken = async (req: Request, res: Response): Promise<void> => {
        const email: string = req.body.email || '';
        try {
            await this.userService.getRefreshToken(email);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * Get userId out of the session cookie
     * @param req
     * @param res
     */
    getIdController = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.session.uuid || !req.session.firstName || !req.session.accessToken) {
                res.status(400).send('Not authenticated');
            }
            // await this.authService.doCheckToken(session.accessToken);
            const user = await this.userService.getUserOfUuid(req.session.uuid);
            await this.userService.doesUserExistInDb(user.id);
            res.status(200).json(user.id);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
