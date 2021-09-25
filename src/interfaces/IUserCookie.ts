
export interface IUserCookie {
    firstName: string;
    uuid: string;
    accessToken: string;
}

// tslint:disable-next-line:only-arrow-functions
export function getIUserCookie(): IUserCookie {
    return {
        firstName: '',
        uuid: '',
        accessToken: '',
    };
}
