import {
    Column,
    Model,
    Table,
    AllowNull,
    ForeignKey,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
    timestamps: true,
})

export class Address extends Model {
    @AllowNull(false)
    @Column
    firstName: string;

    @AllowNull(false)
    @Column
    lastName: string;

    @AllowNull(true)
    @Column
    company: string;

    @AllowNull(false)
    @Column
    phone: string;

    @AllowNull(false)
    @Column
    address1: string;

    @AllowNull(false)
    @Column
    address2: string;

    @AllowNull(false)
    @Column
    city: string;

    @AllowNull(false)
    @Column
    country: string;

    @AllowNull(false)
    @Column
    zipCode: string;

    @AllowNull(false)
    @Column
    isDefault: boolean;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column
    userId: number;
}
