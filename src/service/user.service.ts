import { Service } from 'typedi';
import { config } from 'dotenv';
import { HttpError } from '../errors/http.error';
import { User } from '../db_models/User';
import { IUser } from '../interfaces/IUser';

config(); // load data from .env

@Service()
export class UserService {
    constructor() { }

    /**
     * update user and save the refresh token to the DB
     * @param email string
     * @param refreshToken string
     */
    public async saveRefreshToken(email: string, refreshToken: string): Promise<void> {
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
    public async saveAccessToken(email: string, accessToken: string): Promise<void> {
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
    public async getRefreshToken(email: string): Promise<string> {
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
    public async getAccessToken(email: string): Promise<string> {
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
    public getUserOfEmail(email: string): any {
        if (email) {
            return User.findOne({ where: { email }}).catch(() => {
                throw new HttpError('User not found', 500);
            });
        }
        throw new HttpError('Email must be provided', 400);
    }

    /**
     * Get user of userId
     * @param userId number
     */
    public getUserOfId(userId: number): any {
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
    public async doesUserExistInDb(userId: number): Promise<boolean> {
        if (!userId) {
            throw new HttpError('User id must be provided', 400);
        }

        const user: IUser = await this.getUserOfId(userId);
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
    public getUserOfUuid(uuid: string): any {
        if (!uuid) {
            throw new HttpError('Uuid must be provided', 400);
        }

        return User.findOne(
            { where: { uuid },
            }).catch(() => {
                throw new HttpError('User not found', 500);
            });
    }
}
