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
     * register a new user
     * @param email string
     * @param password string
     * @returns
     */
    public async doRegister(email: string, password: string): Promise<any> {
        if (!email || !password) {
            throw new Error('Missing Data');
        }
        // await this.checkEmailExists(email);

        return User.create({
            email,
            password,
        }).catch(() => {
            throw new Error('User could not be created');
        });
    }

    /**
     * login a user and send to the client accesToken and refreshToken + save refreshToken in DB
     * check if passwords are equal and then login a user
     * @param email string
     * @param username string
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

        await this.comparePasswords(password, foundUser.password);

        const tokenPayload = {
            id: foundUser.id,
         };
        const accessToken = this.generateAccessToken(tokenPayload);
        const refreshToken = jwt.sign(tokenPayload, this.getRefreshTokenSecret());

        try {
            await this.userService.doSaveRefreshToken(foundUser.email, refreshToken);
        } catch (err) {
            throw new HttpError('Could not save refresh token', 500);
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    public async doCheckIsAdmin(token: string): Promise<boolean> {
        const validUser = await this.doCheckToken(token);
        if (!validUser) {
            throw new HttpError('No valid user', 401);
        }

        const decodedToken = await this.decodeToken(token);

        if (!decodedToken) {
            throw new HttpError('Token could not be decoded', 401);
        }

        const user = this.userService.doGetUserOfId(validUser.id);
        if (!user) {
            throw new HttpError('No user found', 401);
        }

        if (user.isAdmin) {
            return true;
        }

        return false;
    }

    /**
     * check if a token is valid
     * @param token string
     * @returns
     */
    public doCheckToken(token: string): any {
        if (!token) {
            throw new HttpError('Access Token is not set', 401);
        }

        return jwt.verify(token, this.getAccessTokenSecret(), (err, user) => {
            if (err) {
                throw new HttpError('Token expired', 401);
            }
            return user;
        });
    }

    /**
     * refresh a token if stored refresh token and the refresh token sent from client are equal and valid
     * @param refreshToken string
     * @returns
     */
    public async doRefreshToken(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            throw new HttpError('No refresh token provided', 401);
        }

        const decodedUser: any = this.decodeToken(refreshToken);
        const storedRefreshToken = await this.userService.doGetRefreshToken(decodedUser.email);

        if (storedRefreshToken !== refreshToken) {
            throw new HttpError('Refresh Token not equal', 401);
        }

        return jwt.verify(storedRefreshToken, this.getRefreshTokenSecret(), async (error, user) => {
            if (error) {
                throw new HttpError('Access denied', 401);
            }

            return this.generateAccessToken({
                email: user?.email,
            });
        });
    }

    public async doLogout(email: string): Promise<any> {
        return User.update(
            { refreshToken: null },
            {where: { email } })
            .catch((err) => {
                throw new HttpError('User could not be Logged Out', 500);
            });
    }

    /**
     * checks if a user with a specific email is already in the DB
     * @param email string
     */
    /* private async checkEmailExists(email: string) {
        const alreadyRegisteredEmail = await User.findAll({ where: { email }});

        if (alreadyRegisteredEmail) {
            throw new HttpError('Email is already in use', 403);
        }
    } */

    /**
     * decode a token to get the payload
     * @param token string
     * @returns
     */
    public decodeToken(token: string): any {
        const decoded: any = jwt.decode(token);
        if (!decoded) {
            throw new HttpError('JWT decode went wrong', 400);
        }
        return decoded;
    }

    /**
     * generates a new valid access token
     * @param user any
     * @returns
     */
    private generateAccessToken(user: any) {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
    }

    /**
     * returns the refresh token secret from .env file if exists
     * @returns
     */
     private getRefreshTokenSecret(): string {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new HttpError('No JWT Token Secret provided', 401);
        }
        return process.env.REFRESH_TOKEN_SECRET;
    }

    /**
     * returns the access token secret from .env file if exists
     * @returns
     */
     private getAccessTokenSecret(): string {
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
     private async comparePasswords(textPassword: string, hashedPassword: string): Promise<boolean> {
        const isPasswordEqual = await bcrypt.compare(textPassword, hashedPassword);
        if (!isPasswordEqual) {
            throw new HttpError('Passwords not equal', 400);
        }
        return isPasswordEqual;
    }
}
