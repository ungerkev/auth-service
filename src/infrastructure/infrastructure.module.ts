import { Module } from '@nestjs/common';

import { CryptoService } from '@/infrastructure/crypto/crypto.service';

import { PrismaService } from './prisma/prisma.service';

@Module({
  providers: [PrismaService, CryptoService],
})
export class InfrastructureModule {}
