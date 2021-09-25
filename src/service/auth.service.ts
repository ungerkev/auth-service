import { Service } from 'typedi';
import { User } from '../db_models/User';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { HttpError } from '../errors/http.error';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';

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

        const foundUser = await this.userService.doGetUserOfEmail(email);
        if (!foundUser) {
            throw new Error('User not found');
        }

        await AuthService.comparePasswords(password, foundUser.password);

        const accessToken: string = this.generateAccessToken();
        const refreshToken: string = this.generateRefreshToken();

        try {
            await this.userService.doSaveAccessToken(foundUser.email, accessToken);
            await this.userService.doSaveRefreshToken(foundUser.email, refreshToken);
        } catch (err) {
            throw new HttpError('Could not save refresh token', 500);
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    public async doLogout(id: number): Promise<any> {
        return User.update(
            { accessToken: null, refreshToken: null },
            {where: { id } })
            .catch((err) => {
                throw new HttpError('User could not be Logged Out', 500);
            });
    }

    /**
     * generates a new valid access token
     * @returns
     */
    public generateAccessToken() {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return jwt.sign({ test: 'test' }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5s' });
    }

    /**
     * generates a new valid refresh token
     * @returns
     */
    public generateRefreshToken() {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return jwt.sign({ test: 'test' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30s' });
    }

    /**
     * returns the refresh token secret from .env file if exists
     * @returns
     */
    public getRefreshTokenSecret(): string {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return process.env.REFRESH_TOKEN_SECRET;
    }

    /**
     * returns the access token secret from .env file if exists
     * @returns
     */
    public getAccessTokenSecret(): string {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return process.env.ACCESS_TOKEN_SECRET;
    }

    /**
     * compare a hashed password with an normal one with bcryptjs
     * @param textPassword string
     * @param hashedPassword string
     * @returns
     */
    private static async comparePasswords(textPassword: string, hashedPassword: string): Promise<boolean> {
        const isPasswordEqual: boolean = await bcrypt.compare(textPassword, hashedPassword);
        if (!isPasswordEqual) {
            throw new HttpError('Passwords not equal', 400);
        }
        return isPasswordEqual;
    }







    public verifyAccessToken(accessToken: string): void {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        try {
            jwt.verify(accessToken, this.getAccessTokenSecret());
        } catch (err) {
            throw new HttpError('Access token is not expired', 400);
        }
    }

    public verifyRefreshToken(refreshToken: string): void {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        try {
            jwt.verify(refreshToken, this.getRefreshTokenSecret());
        } catch (err) {
            throw new HttpError('Refresh token is expired', 400);
        }
    }

}
