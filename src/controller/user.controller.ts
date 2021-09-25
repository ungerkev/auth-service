import { Service } from 'typedi';
import {
    Request,
    Response,
} from 'express';
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
    saveRefreshToken = async (req: Request, res: Response): Promise<void> => {
        const email: string = req.body.email || '';
        const refreshToken: string = req.body.refreshToken || '';

        try {
            await this.userService.doSaveRefreshToken(email, refreshToken);
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
            await this.userService.doGetRefreshToken(email);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    getId = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.session.uuid || !req.session.firstName || !req.session.accessToken) {
                res.status(200).send('Not authenticated');
            }
            // await this.authService.doCheckToken(session.accessToken);
            const user = await this.userService.doGetUserOfUuid(req.session.uuid);
            await this.userService.doCheckIfUserIdExistInDb(user.id);
            res.status(200).json(user.id);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }


    saveAddress = async (req: Request, res: Response): Promise<void> => {
        const userId: number = req.body?.address?.userId || 0;
        const firstName: string = req.body?.address?.firstName || '';
        const lastName: string = req.body?.address?.lastName || '';
        const company: string = req.body?.address?.company || '';
        const phone: string = req.body?.address?.phone || '';
        const address1: string = req.body?.address?.address1 || '';
        const address2: string = req.body?.address?.address2 || '';
        const city: string = req.body?.address?.city || '';
        const country: string = req.body?.address?.country || '';
        const zipCode: string = req.body?.address?.zipCode || '';
        const isDefault: boolean = req.body?.address?.default || false;

        try {
            await this.userService.doSaveAddress(userId, firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    doGetAddressListOfUserId = async (req: Request, res: Response): Promise<void> => {
        const userId: number = parseInt(req.params.userId, 10) || 0;

        try {
            const addresses = await this.userService.doGetAddressListOfUserId(userId);
            res.status(200).json({ addresses });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
