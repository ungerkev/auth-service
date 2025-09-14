import { Injectable } from '@nestjs/common';

import { CryptoService } from '@/infrastructure/crypto/crypto.service';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { PrismaTransactionClient } from '@/infrastructure/prisma/types/prisma';
import { Tenant } from '@/tenants/types/tenant';
import { User } from '@/users/types/user';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Creates a new user in the database with optional transaction support.
   * Hashes the password if provided and returns the user without sensitive data.
   */
  public async createUser(
    data: {
      email: string;
      emailVerified: boolean;
      activeTenantId: string | null;
      password?: string | null;
      passwordRequired?: boolean;
    },
    options?: { transaction?: PrismaTransactionClient },
  ): Promise<Omit<User, 'password'>> {
    return this.prismaService.use(options).user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        activeTenantId: data.activeTenantId,
        password: data.password
          ? await this.cryptoService.hash(data.password)
          : null,
        passwordRequired: data.passwordRequired,
        createdAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: false,
      },
    });
  }

  /**
   * Find user by ID, including password
   * */
  public async findUserById(
    id: string,
    options: {
      transaction?: PrismaTransactionClient;
      withPassword: true;
    },
  ): Promise<User | null>;

  /**
   * Find user by ID, excluding password (default)
   * */
  public async findUserById(
    id: string,
    options?: {
      transaction?: PrismaTransactionClient;
      withPassword?: false;
    },
  ): Promise<Omit<User, 'password'> | null>;

  /**
   * Find user by ID.
   * - Excludes password by default
   * - Include password if `withPassword: true`
   */
  public async findUserById(
    id: string,
    options?: { transaction?: PrismaTransactionClient; withPassword?: boolean },
  ): Promise<Omit<User, 'password'> | User | null> {
    return this.prismaService.use(options).user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: options?.withPassword ?? false,
      },
    });
  }

  /**
   * Find user by email, including password
   */
  public async findUserByEmail(
    email: string,
    options: {
      transaction?: PrismaTransactionClient;
      withPassword: true;
    },
  ): Promise<User | null>;

  /**
   * Find user by email, excluding password (default)
   */
  public async findUserByEmail(
    email: string,
    options?: {
      transaction?: PrismaTransactionClient;
      withPassword?: false;
    },
  ): Promise<Omit<User, 'password'> | null>;

  /**
   * Find user by email.
   * - Excludes password by default
   * - Include password if `withPassword: true`
   */
  public async findUserByEmail(
    email: string,
    options?: {
      transaction?: PrismaTransactionClient;
      withPassword?: boolean;
    },
  ): Promise<Omit<User, 'password'> | User | null> {
    return this.prismaService.use(options).user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: options?.withPassword ?? false,
      },
    });
  }

  /**
   * Permanently deletes a user by their ID.
   */
  public async deleteUserById(
    id: string,
    options: {
      transaction?: PrismaTransactionClient;
    },
  ): Promise<Omit<User, 'password'> | null> {
    return this.prismaService.use(options).user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: false,
      },
    });
  }

  /**
   * Finds all users with unverified emails who registered more than 30 days ago.
   * Used for cleanup of stale accounts.
   *
   * ⚠️ A user is unverified when he did not verify his email after 30 days he created his account
   */
  public async findAllUsersWithUnverifiedEmail(options: {
    transaction?: PrismaTransactionClient;
  }): Promise<Omit<User, 'password'>[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);

    return this.prismaService.use(options).user.findMany({
      where: {
        emailVerified: false,
        createdAt: { lt: dateThreshold },
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: false,
      },
    });
  }

  /**
   * Updates a user's information in the database.
   *
   * ⚠️ Either Id or email must be provided.
   * ⚠️️ Do not update email
   */
  public async updateUser(
    data: {
      id?: string;
      email?: string;
      lastLogin?: Date;
      password?: string;
      passwordRequired?: boolean;
      emailVerified?: boolean;
      activeTenantId?: string | null;
    },
    options?: {
      transaction?: PrismaTransactionClient;
    },
  ): Promise<Omit<User, 'password'>> {
    const { id, email } = data;

    if (!id && !email) {
      throw new Error('Either id or email must be provided');
    }

    // ⚠️️ Do not update email
    return this.prismaService.use(options).user.update({
      where: id ? { id } : { email },
      data: {
        password: data.password
          ? await this.cryptoService.hash(data.password)
          : undefined,
        passwordRequired: data.passwordRequired,
        emailVerified: data.emailVerified,
        lastLogin: data.lastLogin,
        activeTenantId: data.activeTenantId,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        activeTenantId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        passwordRequired: true,
        password: false,
      },
    });
  }

  /**
   * Find all tenants that the given user belongs to.
   * Returns an empty array if the user has no memberships.
   */
  public async findTenantsOfUser(
    userId: string,
    options?: {
      transaction?: PrismaTransactionClient;
    },
  ): Promise<Tenant[]> {
    const userWithMemberships = await this.prismaService
      .use(options)
      .user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            include: { tenant: true },
          },
        },
      });

    return userWithMemberships?.memberships.map((m) => m.tenant) ?? [];
  }
}
