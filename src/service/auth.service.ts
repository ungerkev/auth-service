import { Service } from 'typedi';
import { User } from '../db_models/User';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { HttpError } from '../errors/http.error';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { ACCESS_TOKEN_LIFETIME, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_LIFETIME, REFRESH_TOKEN_SECRET } from '../configs/app.conf';

config(); // load data from .env

@Service()
export class AuthService {
    constructor(private userService: UserService) { }

    /**
     * login a user and send to the client accesToken and refreshToken + save refreshToken in DB
     * check if passwords are equal and then login a user
     * @param email string
     * @param password string
     * @returns
     */
    public async doLogin(email: string, password: string): Promise<{accessToken: string, refreshToken: string}> {
        if (!email || !password) {
            throw new Error('Missing Data');
        }

        const accessToken: string = this.generateAccessToken();
        const refreshToken: string = this.generateRefreshToken();

        try {
            const foundUser = await this.userService.doGetUserOfEmail(email);
            await this.comparePasswords(password, foundUser.password);
            await this.userService.doSaveAccessToken(foundUser.email, accessToken);
            await this.userService.doSaveRefreshToken(foundUser.email, refreshToken);
        } catch (err) {
            throw new HttpError('Could not login', 500);
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Set accessToken and refreshToken in User DB to null
     * @param id
     */
    public async doLogout(id: number): Promise<any> {
        return User.update(
             { accessToken: null, refreshToken: null },
            { where: { id },
            }).catch((err) => {
                throw new HttpError('User could not be Logged Out', 500);
            });
    }

    /**
     * generates a new valid access token
     * @returns
     */
    public generateAccessToken() {
        return jwt.sign({ test: 'test' }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
    }

    /**
     * generates a new valid refresh token
     * @returns
     */
    public generateRefreshToken() {
        return jwt.sign({ test: 'test' }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME });
    }

    /**
     * compare a hashed password with an normal one with bcryptjs
     * @param textPassword string
     * @param hashedPassword string
     * @returns
     */
    public async comparePasswords(textPassword: string, hashedPassword: string): Promise<boolean> {
        const isPasswordEqual: boolean = await bcrypt.compare(textPassword, hashedPassword);
        if (!isPasswordEqual) {
            throw new HttpError('Passwords are not equal', 400);
        }
        return isPasswordEqual;
    }

    /**
     * Verify if access token is valid and not expired
     * @param accessToken string
     */
    public verifyAccessToken(accessToken: string): void {
        try {
            jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new HttpError('Access token is expired', 400);
        }
    }

    /**
     * Verify if refresh token is valid and not expired
     * @param refreshToken string
     */
    public verifyRefreshToken(refreshToken: string): void {
        try {
            jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        } catch (err) {
            throw new HttpError('Refresh token is expired', 400);
        }
    }

}
