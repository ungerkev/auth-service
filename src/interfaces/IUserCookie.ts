
export interface IUserCookie {
    firstName: string;
    uuid: string;
    token: {
        accessToken: string,
        refreshToken: string,
    };
}

// tslint:disable-next-line:only-arrow-functions
export function getIUserCookie(): IUserCookie {
    return {
        firstName: '',
        uuid: '',
        token: {
            accessToken: '',
            refreshToken: '',
        },
    };
}
