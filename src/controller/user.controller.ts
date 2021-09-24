import { Service } from 'typedi';
import {
    Request,
    Response,
} from 'express';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

/**
 * User Controller
 */
@Service()
export class UserController {
    constructor(private userService: UserService,
                private authService: AuthService) {}

    /**
     * update user and save refresh token to the table
     * @param req
     * email: string
     * refreshToken: string
     * @param res
     */
    saveRefreshToken = async (req: Request, res: Response): Promise<void> => {
        const email = req.body.email || '';
        const refreshToken = req.body.refreshToken || '';

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
        const email = req.body.email || '';
        try {
            await this.userService.doGetRefreshToken(email);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    getIdOfToken = async (req: Request, res: Response): Promise<void> => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || '';
        try {
            await this.authService.doCheckToken(token);
            const decodedToken = await this.authService.decodeToken(token);
            await this.userService.doCheckIfUserIdExistInDb(decodedToken);
            res.status(200).json(decodedToken.id);
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }


    saveAddress = async (req: Request, res: Response): Promise<void> => {
        const userId = req.body?.address?.userId || 0;
        const firstName = req.body?.address?.firstName || '';
        const lastName = req.body?.address?.lastName || '';
        const company = req.body?.address?.company || '';
        const phone = req.body?.address?.phone || '';
        const address1 = req.body?.address?.address1 || '';
        const address2 = req.body?.address?.address2 || '';
        const city = req.body?.address?.city || '';
        const country = req.body?.address?.country || '';
        const zipCode = req.body?.address?.zipCode || '';
        const isDefault = req.body?.address?.default || false;

        try {
            await this.userService.doSaveAddress(userId, firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    getAllAddressesOfUserId = async (req: Request, res: Response): Promise<void> => {
        const userId: number = parseInt(req.params.userId, 10) || 0;

        try {
            const addresses = await this.userService.doGetAllAddressesOfUserId(userId);
            res.status(200).json({ addresses });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
