import {Service} from 'typedi';
import {config} from 'dotenv';
import {HttpError} from '../errors/http.error';
import {Address} from '../db_models/Address';
import {IUser} from '../interfaces/IUser';
import {IAddress} from '../interfaces/IAddress';
import {UserService} from './user.service';

config(); // load data from .env

@Service()
export class AddressService {
    constructor(private userService: UserService) { }

    /**
     * Save new users address in DB
     * @param userId number
     * @param firstName string
     * @param lastName string
     * @param company string
     * @param phone string
     * @param address1 string
     * @param address2 string
     * @param city string
     * @param country string
     * @param zipCode string
     * @param isDefault boolean
     */
    public async saveAddress(userId: number,
                             firstName: string,
                             lastName: string,
                             company: string,
                             phone: string,
                             address1: string,
                             address2: string,
                             city: string,
                             country: string,
                             zipCode: string,
                             isDefault: boolean): Promise<void> {

        if (!userId || !firstName || !lastName || !phone || !address1 || !city || !country || !zipCode) {
            throw new HttpError('Missing Data', 400);
        }

        const addresses: { rows: IAddress[], count: number} = await this.getAddressListOfUserId(userId);
        if (addresses?.count > 3) {
            throw new HttpError('Maximal 4 addresses can be saved', 500);
        }

        if (addresses?.count === 0) {
            isDefault = true;
        } else {
            if (isDefault) {
                await this.setDefaultAddressToFalse(userId);
            }
        }

        await Address.create({ userId, firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault }).catch(() => {
            throw new HttpError('Address could not be saved', 500);
        });
    }

    /**
     * Set the stored default address to false if a new default address is being saved
     * @param userId
     */
    public async setDefaultAddressToFalse(userId: number): Promise<void> {
        await Address.update({ isDefault: false }, { where: { userId, isDefault: true }}).catch((err) => {
            throw new HttpError('Could not set default address to false', 500);
        });
    }

    /**
     * Get all address of userId
     * @param userId number
     */
    public async getAddressListOfUserId(userId: number): Promise<{ rows: IAddress[], count: number }> {
        if (!userId) {
            throw new HttpError('Missing Data', 400);
        }

        const user: IUser = this.userService.getUserOfId(userId);
        if (!user) {
            throw new HttpError('No user found', 500);
        }

        const addresses: { rows: IAddress[], count: number } = await Address.findAndCountAll({where: {userId}}).catch(() => {
            throw new HttpError('Could not fetch addresses', 500);
        });

        const defaultAddress: IAddress | undefined = addresses.rows.find((address: IAddress) => address.isDefault);

        if (defaultAddress) {
            const index = addresses.rows.indexOf(defaultAddress);
            if (index > -1) {
                addresses.rows.splice(index, 1);
                addresses.rows.unshift(defaultAddress);
            }
        }

        return addresses;
    }

    /**
     * delete address from DB
     * @param id number
     */
    public async deleteAddressById(id: number): Promise<void> {
        const address: IAddress | null  = await Address.findOne({ where: { id } }).catch(() => {
            throw new HttpError('Could not find address', 500);
        });

        if (!address) {
            return;
        }

        await Address.destroy({ where: { id } }).then(async () => {
            await this.updateDefaultAddressOnDelete(address.userId);
        }).catch((error) => {
            throw new HttpError('Address could not be deleted', 500);
        });
    }

    /**
     * Set isDefault of an random address to true if the default address is deleted
     * @param userId
     */
    private async updateDefaultAddressOnDelete(userId: number) {
        const addresses: { rows: Address[]; count: number } = await Address.findAndCountAll({where: {userId}}).catch(() => {
            throw new HttpError('Could not fetch addresses', 500);
        });

        if (!addresses || addresses.count === 0) {
            return;
        }

        await Address.update(
            {isDefault: true},
            {
                where: {id: addresses.rows[0].id},
            }).catch((err) => {
            throw new HttpError('Could not update default address', 500);
        });
    }


    /**
     * Update an address
     * @param id number
     * @param userId number
     * @param firstName string
     * @param lastName string
     * @param company string
     * @param phone string
     * @param address1 string
     * @param address2 string
     * @param city string
     * @param country string
     * @param zipCode string
     * @param isDefault string
     */
    public async updateAddress(id: number,
                               userId: number,
                               firstName: string,
                               lastName: string,
                               company: string,
                               phone: string,
                               address1: string,
                               address2: string,
                               city: string,
                               country: string,
                               zipCode: string,
                               isDefault: boolean): Promise<void> {

        if (!id || !userId) {
            throw new HttpError('Missing Data', 400);
        }

        const addresses: { rows: IAddress[], count: number} = await this.getAddressListOfUserId(userId);

        if (addresses?.count === 1) {
            isDefault = true;
        } else {
            if (isDefault) {
                // await this.updateDefaultAddressOnDelete(userId);
                await this.setDefaultAddressToFalse(userId);
            }
        }

        await Address.update({ firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault},
        {where: {id }}).catch(() => {
            throw new HttpError('Address could not be saved', 500);
        });
    }

    /**
     * Get an address by its id
     * @param id number
     */
    public async getAddressOfId(id: number): Promise<IAddress | null> {
        if (!id) {
            throw new HttpError('Missing Data', 400);
        }

        return Address.findOne({where: {id}}).catch(() => {
            throw new HttpError('Could not get address', 500);
        });
    }
}
