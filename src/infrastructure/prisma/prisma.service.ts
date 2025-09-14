import {
  Global,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaTransactionClient } from '@/infrastructure/prisma/types/prisma';

import { PrismaClient } from './generated';

@Global()
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Resolve to either the passed transaction client or the global client.
   */
  public use(options?: {
    transaction?: PrismaTransactionClient;
  }): PrismaTransactionClient {
    return options?.transaction ?? this;
  }
}
