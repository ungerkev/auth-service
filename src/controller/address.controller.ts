import { Service } from 'typedi';
import { Request, Response } from 'express';
import {AddressService} from '../service/address.service';

/**
 * User Controller
 */
@Service()
export class AddressController {
    constructor(private addressService: AddressService) {}

    /**
     * Save new users address
     * @param req
     * @param res
     */
    saveAddressController = async (req: Request, res: Response): Promise<void> => {
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
        const isDefault: boolean = req.body?.address?.isDefault || false;

        try {
            await this.addressService.saveAddress(userId, firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    /**
     * Get all addresses of a user
     * @param req
     * @param res
     */
    getAddressListOfUserIdController = async (req: Request, res: Response): Promise<void> => {
        const userId: number = parseInt(req.params.userId, 10) || 0;

        try {
            const addresses = await this.addressService.getAddressListOfUserId(userId);
            res.status(200).json({ addresses });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }

    deleteAddressByIdController = async (req: Request, res: Response): Promise<void> => {
        const id: number = parseInt(req.params.id, 10) || 0;

        try {
            await this.addressService.deleteAddressById(id);
            res.status(200).json({ success: true });
        } catch (e: any) {
            res.status(e.code).send(e.message);
        }
    }
}
