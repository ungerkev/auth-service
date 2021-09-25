/**
 * IUser
 */
export interface IUser {
    id: number;
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    rememberMe: boolean;
    accessToken: string;
    refreshToken: string;
}

/**
 * Get IUser
 * @returns IUser
 */
// tslint:disable-next-line:only-arrow-functions
export function getIUser(): IUser {
    return {
        id: 0,
        uuid: '',
        email: '',
        firstName: '',
        lastName: '',
        isAdmin: false,
        rememberMe: false,
        accessToken: '',
        refreshToken: '',
    };
}

