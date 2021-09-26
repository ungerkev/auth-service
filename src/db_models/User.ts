import {
    Column,
    Model,
    Table,
    AllowNull,
    BeforeBulkUpdate,
    BeforeCreate, Unique,
} from 'sequelize-typescript';
import { genSaltSync, hashSync } from 'bcryptjs';

@Table({
    timestamps: true,
})

export class User extends Model {
    @AllowNull(false)
    @Unique
    @Column
    uuid: string;

    @AllowNull(false)
    @Unique
    @Column
    email: string;

    @AllowNull(false)
    @Column
    password: string;

    @AllowNull(true)
    @Column
    accessToken: string;

    @AllowNull(true)
    @Column
    refreshToken: string;

    @AllowNull(false)
    @Column
    isAdmin: boolean;

    @AllowNull(false)
    @Column
    firstName: string;

    @AllowNull(false)
    @Column
    lastName: string;

    @BeforeCreate
    @BeforeBulkUpdate
    static hashPassword(instance: any): void {
        const salt = genSaltSync(10);

        if (!instance.isNewRecord && instance.fields.indexOf('password') < 0) {
            return;
        }

        if (!instance.isNewRecord && instance.fields.indexOf('password') >= 0) {
            instance.salt = salt;
            instance.attributes.password = hashSync(instance.attributes.password, salt);
        } else if (instance.isNewRecord) {
            instance.salt = salt;
            instance.password = hashSync(instance.password, salt);
        }
    }
}
