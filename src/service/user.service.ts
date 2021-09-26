import { Service } from 'typedi';
import { config } from 'dotenv';
import { HttpError } from '../errors/http.error';
import { User } from '../db_models/User';
import { Address } from '../db_models/Address';
import { IUser } from '../interfaces/IUser';
import { IAddress } from '../interfaces/IAddress';

config(); // load data from .env

@Service()
export class UserService {
    constructor() { }

    /**
     * update user and save the refresh token to the DB
     * @param email string
     * @param refreshToken string
     */
    public async doSaveRefreshToken(email: string, refreshToken: string): Promise<void> {
        if (!email || !refreshToken) {
            throw new HttpError('Missing Data', 400);
        }

        await User.update(
             { refreshToken },
            { where: { email },
            }).catch((err) => {
                throw new HttpError('User could not be updated', 500);
            });
    }

    /**
     * update user and save the access token to the DB
     * @param email
     * @param accessToken string
     */
    public async doSaveAccessToken(email: string, accessToken: string): Promise<void> {
        if (!email) {
            throw new HttpError('Missing Data', 400);
        }

        await User.update(
             { accessToken },
            { where: { email },
            }).catch((err) => {
                throw new HttpError('User could not be updated', 500);
            });
    }

    /**
     * return the refresh token from user with specific email
     * @param email string
     * @returns
     */
    public async doGetRefreshToken(email: string): Promise<string> {
        if (!email) {
            throw new HttpError('Missing Data', 400);
        }

        return User.findOne(
            { where: { email },
            }).then((user) => {
                if (user && user.refreshToken) {
                    return user.refreshToken;
                }
                return '';
            }).catch(() => {
                throw new HttpError('User not found', 404);
            });
    }

    /**
     * Get access token from user DB
     * @param email string
     */
    public async doGetAccessToken(email: string): Promise<string> {
        if (!email) {
            throw new HttpError('Missing Data', 400);
        }

        return User.findOne(
            { where: { email },
            }).then((user) => {
                if (user && user.accessToken) {
                    return user.accessToken;
                }
                return '';
            }).catch(() => {
                throw new HttpError('User not found', 404);
            });
    }

    /**
     * return user of email
     * @param email string
     * @returns
     */
    public doGetUserOfEmail(email: string): any {
        if (email) {
            return User.findOne({ where: { email }}).catch(() => {
                throw new HttpError('User not found', 500);
            });
        }
        throw new HttpError('Email must be provided', 400);
    }

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
    public async doSaveAddress(userId: number,
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

        const addresses: { rows: IAddress[], count: number} = await this.doGetAddressListOfUserId(userId);
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

        await Address.create({
            userId, firstName, lastName, company, phone, address1, address2, city, country, zipCode, isDefault,
        }).catch(() => {
            throw new HttpError('Address could not be saved', 500);
        });
    }

    public async setDefaultAddressToFalse(userId: number): Promise<void> {
        await Address.update(
             { isDefault: false },
            { where: {
                        userId,
                        isDefault: true,
                        },
            }).catch((err) => {
            throw new HttpError('Could not set default address to false', 500);
        });
    }

    /**
     * Get all address of userId
     * @param userId number
     */
    public async doGetAddressListOfUserId(userId: number): Promise<{ rows: IAddress[], count: number }> {
        if (!userId) {
            throw new HttpError('Missing Data', 400);
        }

        const user: IUser = this.doGetUserOfId(userId);
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
     * Get user of userId
     * @param userId number
     */
    public doGetUserOfId(userId: number): any {
        if (!userId) {
            throw new HttpError('Missing data', 400);
        }

        return User.findOne({ where: { id: userId}}).catch(() => {
            throw new HttpError('No user found', 500);
        });
    }

    /**
     * Check if a user with this userId exists in the DB
     * @param userId number
     */
    public async doCheckIfUserIdExistInDb(userId: number): Promise<boolean> {
        if (!userId) {
            throw new HttpError('User id must be provided', 400);
        }

        const user: IUser = await this.doGetUserOfId(userId);
        if (!user) {
            throw new HttpError('No user found', 400);
        }

        return true;
    }

    /**
     * return user of uuid
     * @returns
     * @param uuid string
     */
    public doGetUserOfUuid(uuid: string): any {
        if (!uuid) {
            throw new HttpError('Uuid must be provided', 400);
        }

        return User.findOne(
            { where: { uuid },
            }).catch(() => {
                throw new HttpError('User not found', 500);
            });
    }

    /**
     * delete address from DB
     * @param id number
     */
    public async doDeleteAddressById(id: number): Promise<void> {
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
}
